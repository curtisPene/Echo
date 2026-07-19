import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { BlockContactService } from "../../../authAndAccess/services/BlockContactService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { contactsRepo } from "../../../authAndAccess/repo/ContactsRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { RoomRepo } from "../../repo/mongooseRoomRepo";
import { MessageRepo } from "../../../messaging/repo/mongooseMessageRepo";
import { FindRoomsForUserService } from "../../services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "../../services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../../services/DeleteRoomService";
import { DeleteRoomMessagesService } from "../../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../../messaging/services/RedactUserMessagesInRoomService";
import { registerAndLogin, createFakeSocket, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));

// Used as setup in one test ("rejects creating a room with a participant
// who has blocked the creator") - not the subject under test, but still
// needs a socket that won't throw, so a fake one is used rather than the
// real composed instance from authAndAccess/composition.ts.
const blockContactService = new BlockContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  new FindRoomsForUserService(roomRepo),
  new RemoveParticipantFromRoomService(roomRepo),
  new DeleteRoomService(roomRepo),
  new DeleteRoomMessagesService(messageRepo),
  new RedactUserMessagesInRoomService(messageRepo),
);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("CreateNewRoomService", () => {
  it("creates a 1:1 room with the creator accepted and the participant pending", async () => {
    const creator = await registerAndLogin("Creator");
    const participant = await registerAndLogin("Participant");

    const result = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: participant.id }],
      name: "Creator, Participant",
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.participants).toHaveLength(2);

    const creatorParticipant = result.data.participants.find((p) => p.userId === creator.id);
    const otherParticipant = result.data.participants.find((p) => p.userId === participant.id);

    expect(creatorParticipant?.status).toBe("accepted");
    expect(otherParticipant?.status).toBe("pending");

    await cleanupUser(creator);
    await cleanupUser(participant);
  });

  it("creates a group room with every non-creator participant pending", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const result = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: b.id }, { user: c.id }],
      name: "Group chat",
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.participants).toHaveLength(3);
    expect(result.data.participants.filter((p) => p.status === "pending")).toHaveLength(2);

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(c);
  });

  it("fails with 'One or more participants could not be found' for a nonexistent participant id", async () => {
    const creator = await registerAndLogin("Creator");

    const result = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: new mongoose.Types.ObjectId().toString() }],
      name: "Ghost",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("One or more participants could not be found");

    await cleanupUser(creator);
  });

  it("rejects creating a room with a participant the creator has blocked", async () => {
    const creator = await registerAndLogin("Creator");
    const blocked = await registerAndLogin("Blocked");

    const blockResult = await blockContactService.execute({
      user: creator.id,
      blockedUser: blocked.id,
    });
    expect(blockResult.success).toBe(true);

    const result = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: blocked.id }],
      name: "Creator, Blocked",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("You have blocked one or more participants");

    await cleanupUser(creator);
    await cleanupUser(blocked);
  });

  it("rejects creating a room with a participant who has blocked the creator", async () => {
    const creator = await registerAndLogin("Creator");
    const blocker = await registerAndLogin("Blocker");

    const blockResult = await blockContactService.execute({
      user: blocker.id,
      blockedUser: creator.id,
    });
    expect(blockResult.success).toBe(true);

    const result = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: blocker.id }],
      name: "Creator, Blocker",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("One or more participants have blocked you");

    await cleanupUser(creator);
    await cleanupUser(blocker);
  });
});
