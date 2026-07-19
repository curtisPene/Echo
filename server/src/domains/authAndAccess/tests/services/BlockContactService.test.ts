import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../composition";
import { AddContactService } from "../../services/AddContactService";
import { BlockContactService } from "../../services/BlockContactService";
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

const addContactService = new AddContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  createNewRoomService,
);

// This IS the subject under test, so it's constructed here directly with a
// fake socket - isolating it from the real SocketIOAuthAndAccessSocket
// adapter (which needs a real attached io) rather than reusing the real
// composed instance from composition.ts.
const blockContactService = new BlockContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  new FindRoomsForUserService(),
  new RemoveParticipantFromRoomService(),
  new DeleteRoomService(),
  new DeleteRoomMessagesService(),
  new RedactUserMessagesInRoomService(),
);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("BlockContactService", () => {
  it("moves the blocked user into the blocker's blocked list and removes them from contacts", async () => {
    const blocker = await registerAndLogin("Blocker");
    const target = await registerAndLogin("Target");

    const added = await addContactService.execute({
      userId: blocker.id,
      contactId: target.id,
    });
    expect(added.success).toBe(true);

    const result = await blockContactService.execute({
      user: blocker.id,
      blockedUser: target.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(
      result.data.blocker.blocked.some((c) => c.userId === target.id),
    ).toBe(true);
    expect(
      result.data.blocker.contacts.some((c) => c.userId === target.id),
    ).toBe(false);

    await cleanupUser(blocker);
    await cleanupUser(target);
  });

  it("deletes the shared 1:1 room entirely", async () => {
    const blocker = await registerAndLogin("Blocker");
    const target = await registerAndLogin("Target");

    const added = await addContactService.execute({
      userId: blocker.id,
      contactId: target.id,
    });
    expect(added.success).toBe(true);
    if (!added.success || !added.data) throw new Error("unreachable");

    const roomId = added.data.room.id;

    const result = await blockContactService.execute({
      user: blocker.id,
      blockedUser: target.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.rooms).toHaveLength(1);
    expect(result.data.rooms[0]).toEqual({ roomId });
    // The 1:1 case's result entry has no `room` field - the room is gone.
    expect("room" in result.data.rooms[0]).toBe(false);

    await cleanupUser(blocker);
    await cleanupUser(target);
  });

  it("removes the blocker from a shared group room instead of deleting it", async () => {
    const blocker = await registerAndLogin("Blocker");
    const target = await registerAndLogin("Target");
    const third = await registerAndLogin("Third");

    const room = await createNewRoomService.execute({
      user: blocker.id,
      participants: [{ user: target.id }, { user: third.id }],
      name: "Group chat",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await blockContactService.execute({
      user: blocker.id,
      blockedUser: target.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.rooms).toHaveLength(1);
    const affectedRoom = result.data.rooms[0];
    expect("room" in affectedRoom).toBe(true);
    if (!("room" in affectedRoom)) throw new Error("unreachable");

    // The blocker is removed; target and third remain.
    const participantIds = affectedRoom.room.participants.map((p) => p.userId);
    expect(participantIds).not.toContain(blocker.id);
    expect(participantIds).toContain(target.id);
    expect(participantIds).toContain(third.id);

    await cleanupUser(blocker);
    await cleanupUser(target);
    await cleanupUser(third);
  });

  it("fails with 'User not found' when the target id doesn't correspond to a real user", async () => {
    const blocker = await registerAndLogin("Blocker");

    const result = await blockContactService.execute({
      user: blocker.id,
      blockedUser: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");

    await cleanupUser(blocker);
  });
});
