import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { DeleteRoomService } from "../../services/DeleteRoomService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { RoomRepo } from "../../repo/mongooseRoomRepo";
import { registerAndLogin, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const deleteRoomService = new DeleteRoomService(roomRepo);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("DeleteRoomService", () => {
  it("deletes an existing room and returns true", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");

    const room = await createNewRoomService.execute({
      user: creator,
      participants: [{ user: b.id }],
      name: "Creator, B",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await deleteRoomService.execute({ roomId: room.data.id });

    expect(result).toBe(true);

    const stillThere = await roomRepo.findById({ roomId: room.data.id });
    expect(stillThere).toBeNull();

    await cleanupUser(creator);
    await cleanupUser(b);
  });

  it("returns false for a nonexistent room id", async () => {
    const result = await deleteRoomService.execute({
      roomId: new mongoose.Types.ObjectId().toString(),
    });

    expect(result).toBe(false);
  });
});
