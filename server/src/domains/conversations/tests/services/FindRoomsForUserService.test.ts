import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { FindRoomsForUserService } from "../../services/FindRoomsForUserService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { RoomRepo } from "../../repo/mongooseRoomRepo";
import { registerAndLogin, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const findRoomsForUserService = new FindRoomsForUserService(roomRepo);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("FindRoomsForUserService", () => {
  it("returns every room the user is a participant in", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const roomOne = await createNewRoomService.execute({
      user: a,
      participants: [{ id: b.id }],
      name: "A, B",
    });
    const roomTwo = await createNewRoomService.execute({
      user: a,
      participants: [{ id: c.id }],
      name: "A, C",
    });
    expect(roomOne.success).toBe(true);
    expect(roomTwo.success).toBe(true);
    if (!roomOne.success || !roomOne.data || !roomTwo.success || !roomTwo.data)
      throw new Error("unreachable");

    const result = await findRoomsForUserService.execute({ userId: a.id });

    const roomIds = result.map((room) => room.id);
    expect(roomIds).toContain(roomOne.data.id);
    expect(roomIds).toContain(roomTwo.data.id);

    await cleanupUser(a);
    await cleanupUser(b);
    await cleanupUser(c);
  });

  it("returns an empty array for a user with no rooms", async () => {
    const a = await registerAndLogin("A");

    const result = await findRoomsForUserService.execute({ userId: a.id });

    expect(result).toEqual([]);

    await cleanupUser(a);
  });

  it("excludes rooms the user is not a participant of", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const room = await createNewRoomService.execute({
      user: b,
      participants: [{ id: c.id }],
      name: "B, C",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await findRoomsForUserService.execute({ userId: a.id });

    const roomIds = result.map((r) => r.id);
    expect(roomIds).not.toContain(room.data.id);

    await cleanupUser(a);
    await cleanupUser(b);
    await cleanupUser(c);
  });
});
