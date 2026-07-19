import "dotenv/config";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { AcceptRoomInviteService } from "../../services/AcceptRoomInviteService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { RoomRepo } from "../../repo/mongooseRoomRepo";
import { registerAndLogin, createFakeSocket, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));

let fakeSocket: ReturnType<typeof createFakeSocket>;
let acceptRoomInviteService: AcceptRoomInviteService;

beforeEach(() => {
  fakeSocket = createFakeSocket();
  acceptRoomInviteService = new AcceptRoomInviteService(roomRepo, fakeSocket.socket);
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
      participants: [{ user: invitee.id }],
      name: "Creator, Invitee",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await acceptRoomInviteService.execute({
      user: invitee,
      roomId: room.data.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    const inviteeParticipant = result.data.participants.find((p) => p.userId === invitee.id);
    expect(inviteeParticipant?.status).toBe("accepted");

    await cleanupUser(creator);
    await cleanupUser(invitee);
  });

  it("notifies every other participant via room:updated", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: invitee.id }],
      name: "Creator, Invitee",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    await acceptRoomInviteService.execute({
      user: invitee,
      roomId: room.data.id,
    });

    const notifyCall = fakeSocket.calls.find((call) => call.method === "emitToUser");
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
      participants: [{ user: invitee.id }],
      name: "Creator, Invitee",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await acceptRoomInviteService.execute({
      user: stranger,
      roomId: room.data.id,
    });

    expect(result.success).toBe(false);

    await cleanupUser(creator);
    await cleanupUser(invitee);
    await cleanupUser(stranger);
  });
});
