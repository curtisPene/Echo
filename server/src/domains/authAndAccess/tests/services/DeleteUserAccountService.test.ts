import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../composition";
import { AddContactService } from "../../services/AddContactService";
import { DeleteUserAccountService } from "../../services/DeleteUserAccountService";
import { userRepo } from "../../repo/UserRepo";
import { contactsRepo } from "../../repo/ContactsRepo";
import { FindRoomsForUserService } from "../../../conversations/services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "../../../conversations/services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../../../conversations/services/DeleteRoomService";
import { DeleteRoomMessagesService } from "../../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../../messaging/services/RedactUserMessagesInRoomService";
import { registerAndLogin, createFakeSocket, cleanupUser } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

// This IS the subject under test, so it's constructed here directly with a
// fake socket - isolating it from the real SocketIOAuthAndAccessSocket
// adapter (which needs a real attached io) rather than reusing the real
// composed instance from composition.ts.
const deleteUserAccountService = new DeleteUserAccountService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  new FindRoomsForUserService(),
  new RemoveParticipantFromRoomService(),
  new DeleteRoomService(),
  new DeleteRoomMessagesService(),
  new RedactUserMessagesInRoomService(),
);

const addContactService = new AddContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  createNewRoomService,
);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("DeleteUserAccountService", () => {
  it("deletes the user document and their contacts document", async () => {
    const user = await registerAndLogin("A");

    const result = await deleteUserAccountService.execute({ user });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.deletedUserId).toBe(user.id);

    const found = await userRepo.findById({ id: user.id });
    expect(found).toBeNull();
  });

  it("fails with 'User not found' for an already-deleted / unknown user", async () => {
    const result = await deleteUserAccountService.execute({
      user: {
        id: "507f1f77bcf86cd799439011",
        firstName: "Ghost",
        lastName: "User",
        email: "ghost@example.com",
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");
  });

  it("removes the deleted user from every other user's contacts list", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const added = await addContactService.execute({
      userId: a.id,
      contactId: b.id,
    });
    expect(added.success).toBe(true);

    await deleteUserAccountService.execute({ user: b });

    const aContacts = await contactsRepo.findByUserId({ userId: a.id });
    expect(aContacts.hasContact(b.id)).toBe(false);

    await deleteUserAccountService.execute({ user: a });
  });

  it("deletes a shared 1:1 room entirely", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const added = await addContactService.execute({
      userId: a.id,
      contactId: b.id,
    });
    expect(added.success).toBe(true);
    if (!added.success || !added.data) throw new Error("unreachable");

    const result = await deleteUserAccountService.execute({ user: a });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.rooms).toHaveLength(1);
    expect(result.data.rooms[0]).toEqual({ roomId: added.data.room.id });

    await deleteUserAccountService.execute({ user: b });
  });

  it("removes the deleted user from a shared group room, leaving the room and other members intact", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const room = await createNewRoomService.execute({
      user: a.id,
      participants: [{ user: b.id }, { user: c.id }],
      name: "Group chat",
    });
    expect(room.success).toBe(true);

    const result = await deleteUserAccountService.execute({ user: a });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    const affectedRoom = result.data.rooms[0];
    expect("room" in affectedRoom).toBe(true);
    if (!("room" in affectedRoom)) throw new Error("unreachable");

    const participantIds = affectedRoom.room.participants.map((p) => p.userId);
    expect(participantIds).not.toContain(a.id);
    expect(participantIds).toContain(b.id);
    expect(participantIds).toContain(c.id);

    await deleteUserAccountService.execute({ user: b });
    await deleteUserAccountService.execute({ user: c });
  });
});
