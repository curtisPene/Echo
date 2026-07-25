import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { AddParticipantToRoomService } from "../../services/AddParticipantToRoomService";
import { BlockContactService } from "../../../authAndAccess/services/BlockContactService";
import { VerifyUserIdService } from "../../../authAndAccess/services/VerifyUserIdService";
import { GetUsersContactsService } from "../../../authAndAccess/services/GetUsersContactsService";
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
import {
  registerAndLogin,
  createFakeSocket,
  cleanupUser,
} from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));
const findUserIdentitiesService = new FindUserIdentitiesService(userRepo);
const verifyUserIdService = new VerifyUserIdService(userRepo);
const getUsersContactsService = new GetUsersContactsService(contactsRepo);

function createBlockContactService(fakeSocket: ReturnType<typeof createFakeSocket>) {
  return new BlockContactService(
    userRepo,
    contactsRepo,
    fakeSocket.socket,
    new FindRoomsForUserService(roomRepo),
    new RemoveParticipantFromRoomService(roomRepo),
    new DeleteRoomService(roomRepo),
    new DeleteRoomMessagesService(messageRepo),
    new RedactUserMessagesInRoomService(messageRepo),
  );
}

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("AddParticipantToRoomService", () => {
  it("adds a new participant as pending, notifies existing participants, and joins the new participant's sockets", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    expect(roomResult.success).toBe(true);
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new AddParticipantToRoomService(
      roomRepo,
      verifyUserIdService,
      getUsersContactsService,
      findUserIdentitiesService,
      fakeSocket.socket,
    );

    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      participantId: c.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.participants).toHaveLength(3);
    const added = result.data.participants.find((p) => p.userId === c.id);
    expect(added?.status).toBe("pending");

    // Notifies everyone except the acting user (creator) - both the
    // pre-existing participant (B) and the newly-added one (C, so their
    // client learns about the room immediately, same as AddContactService
    // does for a brand-new 1:1).
    const emitToUserCalls = fakeSocket.calls.filter((call) => call.method === "emitToUser");
    expect(emitToUserCalls).toHaveLength(2);
    const notifiedUserIds = emitToUserCalls.map(
      (call) => (call.args as { userId: string }).userId,
    );
    expect(notifiedUserIds.sort()).toEqual([b.id, c.id].sort());

    // Joins the new participant's own sockets live.
    const joinRoomCalls = fakeSocket.calls.filter((call) => call.method === "joinRoom");
    expect(joinRoomCalls).toHaveLength(1);
    expect(joinRoomCalls[0].args).toEqual({ userId: c.id, roomId: roomResult.data.id });

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(c);
  });

  it("fails with 'Room not found' for a nonexistent room id", async () => {
    const creator = await registerAndLogin("Creator");
    const target = await registerAndLogin("Target");

    const fakeSocket = createFakeSocket();
    const service = new AddParticipantToRoomService(
      roomRepo,
      verifyUserIdService,
      getUsersContactsService,
      findUserIdentitiesService,
      fakeSocket.socket,
    );

    const result = await service.execute({
      user: creator,
      roomId: new mongoose.Types.ObjectId().toString(),
      participantId: target.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Room not found");

    await cleanupUser(creator);
    await cleanupUser(target);
  });

  it("rejects adding a participant by a user who isn't a participant of the room", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const outsider = await registerAndLogin("Outsider");
    const target = await registerAndLogin("Target");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new AddParticipantToRoomService(
      roomRepo,
      verifyUserIdService,
      getUsersContactsService,
      findUserIdentitiesService,
      fakeSocket.socket,
    );

    const result = await service.execute({
      user: outsider,
      roomId: roomResult.data.id,
      participantId: target.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Not a participant of this room");

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(outsider);
    await cleanupUser(target);
  });

  it("fails with 'User not found' for a nonexistent participant id", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new AddParticipantToRoomService(
      roomRepo,
      verifyUserIdService,
      getUsersContactsService,
      findUserIdentitiesService,
      fakeSocket.socket,
    );

    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      participantId: new mongoose.Types.ObjectId().toString(),
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");

    await cleanupUser(creator);
    await cleanupUser(b);
  });

  it("rejects adding someone already in the room", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new AddParticipantToRoomService(
      roomRepo,
      verifyUserIdService,
      getUsersContactsService,
      findUserIdentitiesService,
      fakeSocket.socket,
    );

    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      participantId: b.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("already in room");

    await cleanupUser(creator);
    await cleanupUser(b);
  });

  it("rejects adding someone an existing participant (including the acting user) has blocked", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const blocked = await registerAndLogin("Blocked");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    // Creator (an existing participant) has blocked "blocked".
    const blockFakeSocket = createFakeSocket();
    const blockContactService = createBlockContactService(blockFakeSocket);
    const blockResult = await blockContactService.execute({
      user: creator.id,
      blockedUser: blocked.id,
    });
    expect(blockResult.success).toBe(true);

    const fakeSocket = createFakeSocket();
    const service = new AddParticipantToRoomService(
      roomRepo,
      verifyUserIdService,
      getUsersContactsService,
      findUserIdentitiesService,
      fakeSocket.socket,
    );

    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      participantId: blocked.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Someone already in this conversation has blocked this user",
    );

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(blocked);
  });

  it("rejects adding someone who has blocked an existing (non-acting) participant", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const blocker = await registerAndLogin("Blocker");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    // "blocker" has blocked b (an existing participant, not the acting user).
    const blockFakeSocket = createFakeSocket();
    const blockContactService = createBlockContactService(blockFakeSocket);
    const blockResult = await blockContactService.execute({
      user: blocker.id,
      blockedUser: b.id,
    });
    expect(blockResult.success).toBe(true);

    const fakeSocket = createFakeSocket();
    const service = new AddParticipantToRoomService(
      roomRepo,
      verifyUserIdService,
      getUsersContactsService,
      findUserIdentitiesService,
      fakeSocket.socket,
    );

    // Creator (who has no block relationship with "blocker") tries to add them.
    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      participantId: blocker.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "This user has blocked someone already in this conversation",
    );

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(blocker);
  });
});
