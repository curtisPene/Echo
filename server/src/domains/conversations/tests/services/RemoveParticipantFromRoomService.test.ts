import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { RemoveParticipantFromRoomService } from "../../services/RemoveParticipantFromRoomService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { RoomRepo } from "../../repo/mongooseRoomRepo";
import { registerAndLogin, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const removeParticipantFromRoomService = new RemoveParticipantFromRoomService(roomRepo);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("RemoveParticipantFromRoomService", () => {
  it("removes the given participant, leaving the rest of the room intact", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: b.id }, { user: c.id }],
      name: "Group chat",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await removeParticipantFromRoomService.execute({
      roomId: room.data.id,
      userId: b.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    const participantIds = result.data.participants.map((p) => p.userId);
    expect(participantIds).not.toContain(b.id);
    expect(participantIds).toContain(creator.id);
    expect(participantIds).toContain(c.id);

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(c);
  });

  it("fails with 'Room not found' for a nonexistent room id", async () => {
    const creator = await registerAndLogin("Creator");

    const result = await removeParticipantFromRoomService.execute({
      roomId: new mongoose.Types.ObjectId().toString(),
      userId: creator.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Room not found");

    await cleanupUser(creator);
  });

  it("fails when the given user is not a participant of the room", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const stranger = await registerAndLogin("Stranger");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: b.id }],
      name: "Creator, B",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await removeParticipantFromRoomService.execute({
      roomId: room.data.id,
      userId: stranger.id,
    });

    expect(result.success).toBe(false);

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(stranger);
  });
});
