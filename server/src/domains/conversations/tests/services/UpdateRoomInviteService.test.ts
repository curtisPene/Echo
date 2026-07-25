import "dotenv/config";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { UpdateRoomInviteService } from "../../services/UpdateRoomInviteService";
import { RemoveParticipantFromRoomService } from "../../services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../../services/DeleteRoomService";
import { DeleteRoomMessagesService } from "../../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../../messaging/services/RedactUserMessagesInRoomService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { RoomRepo } from "../../repo/mongooseRoomRepo";
import { MessageRepo } from "../../../messaging/repo/mongooseMessageRepo";
import {
  registerAndLogin,
  createFakeSocket,
  cleanupUser,
} from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));

let fakeSocket: ReturnType<typeof createFakeSocket>;
let acceptRoomInviteService: UpdateRoomInviteService;

beforeEach(() => {
  fakeSocket = createFakeSocket();
  acceptRoomInviteService = new UpdateRoomInviteService(
    roomRepo,
    fakeSocket.socket,
    new DeleteRoomService(roomRepo),
    new DeleteRoomMessagesService(messageRepo),
    new RedactUserMessagesInRoomService(messageRepo),
    new RemoveParticipantFromRoomService(roomRepo),
  );
});

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("AcceptRoomInviteService", () => {
  it("flips the accepting participant's status from pending to accepted", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: invitee.id }],
      name: "Creator, Invitee",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await acceptRoomInviteService.execute({
      user: invitee,
      roomId: room.data.id,
      isAcceptRequest: true,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    if (result.data.roomDeleted) throw new Error("unreachable");

    const inviteeParticipant = result.data.room.participants.find(
      (p) => p.userId === invitee.id,
    );
    expect(inviteeParticipant?.status).toBe("accepted");

    await cleanupUser(creator);
    await cleanupUser(invitee);
  });

  it("deletes the whole room when declining a 1:1 invite, rather than leaving a dangling single-participant room", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: invitee.id }],
      name: "Creator, Invitee",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await acceptRoomInviteService.execute({
      user: invitee,
      roomId: room.data.id,
      isAcceptRequest: false,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    if (!result.data.roomDeleted) throw new Error("unreachable");
    expect(result.data.roomId).toBe(room.data.id);

    const stillExists = await roomRepo.findById({ roomId: room.data.id });
    expect(stillExists).toBeNull();

    const notifyCall = fakeSocket.calls.find(
      (call) => call.method === "emitToUser",
    );
    expect(notifyCall).toBeDefined();
    expect((notifyCall?.args as { userId: string }).userId).toBe(creator.id);
    expect((notifyCall?.args as { event: string }).event).toBe("room:deleted");

    await cleanupUser(creator);
    await cleanupUser(invitee);
  });

  it("only removes the declining participant (does NOT delete the room) when declining a group invite", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");
    const other = await registerAndLogin("Other");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: invitee.id }, { id: other.id }],
      name: "Group",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await acceptRoomInviteService.execute({
      user: invitee,
      roomId: room.data.id,
      isAcceptRequest: false,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    if (result.data.roomDeleted) throw new Error("unreachable");

    const inviteeParticipant = result.data.room.participants.find(
      (p) => p.userId === invitee.id,
    );
    expect(inviteeParticipant).toBeUndefined();

    const stillExists = await roomRepo.findById({ roomId: room.data.id });
    expect(stillExists).not.toBeNull();

    await cleanupUser(creator);
    await cleanupUser(invitee);
    await cleanupUser(other);
  });

  it("notifies every other participant via room:updated", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: invitee.id }],
      name: "Creator, Invitee",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    await acceptRoomInviteService.execute({
      user: invitee,
      roomId: room.data.id,
      isAcceptRequest: true,
    });

    const notifyCall = fakeSocket.calls.find(
      (call) => call.method === "emitToUser",
    );
    expect(notifyCall).toBeDefined();
    expect((notifyCall?.args as { userId: string }).userId).toBe(creator.id);
    expect((notifyCall?.args as { event: string }).event).toBe("room:updated");

    await cleanupUser(creator);
    await cleanupUser(invitee);
  });

  it("fails with 'Room not found' for a nonexistent room id", async () => {
    const invitee = await registerAndLogin("Invitee");

    const result = await acceptRoomInviteService.execute({
      user: invitee,
      roomId: new mongoose.Types.ObjectId().toString(),
      isAcceptRequest: true,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Room not found");

    await cleanupUser(invitee);
  });

  it("fails when the accepting user is not a participant of the room", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");
    const stranger = await registerAndLogin("Stranger");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: invitee.id }],
      name: "Creator, Invitee",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await acceptRoomInviteService.execute({
      user: stranger,
      roomId: room.data.id,
      isAcceptRequest: true,
    });

    expect(result.success).toBe(false);

    await cleanupUser(creator);
    await cleanupUser(invitee);
    await cleanupUser(stranger);
  });
});
