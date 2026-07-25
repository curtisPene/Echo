import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { RenameRoomService } from "../../services/RenameRoomService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { RoomRepo } from "../../repo/mongooseRoomRepo";
import {
  registerAndLogin,
  createFakeSocket,
  cleanupUser,
} from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("RenameRoomService", () => {
  it("renames the room and notifies every other participant", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new RenameRoomService(roomRepo, fakeSocket.socket);

    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      name: "New Room Name",
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.name).toBe("New Room Name");

    const emitToUserCalls = fakeSocket.calls.filter((call) => call.method === "emitToUser");
    expect(emitToUserCalls).toHaveLength(1);
    expect(emitToUserCalls[0].args).toMatchObject({ userId: b.id, event: "room:updated" });

    await cleanupUser(creator);
    await cleanupUser(b);
  });

  it("trims the new name", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new RenameRoomService(roomRepo, fakeSocket.socket);

    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      name: "  Padded Name  ",
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.name).toBe("Padded Name");

    await cleanupUser(creator);
    await cleanupUser(b);
  });

  it("rejects an empty or whitespace-only name", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new RenameRoomService(roomRepo, fakeSocket.socket);

    const result = await service.execute({
      user: creator,
      roomId: roomResult.data.id,
      name: "   ",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("cannot be empty");

    await cleanupUser(creator);
    await cleanupUser(b);
  });

  it("fails with 'Room not found' for a nonexistent room id", async () => {
    const creator = await registerAndLogin("Creator");

    const fakeSocket = createFakeSocket();
    const service = new RenameRoomService(roomRepo, fakeSocket.socket);

    const result = await service.execute({
      user: creator,
      roomId: new mongoose.Types.ObjectId().toString(),
      name: "New Name",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Room not found");

    await cleanupUser(creator);
  });

  it("rejects renaming by a user who isn't a participant of the room", async () => {
    const creator = await registerAndLogin("Creator");
    const b = await registerAndLogin("B");
    const outsider = await registerAndLogin("Outsider");

    const roomResult = await createNewRoomService.execute({
      user: creator,
      participants: [{ id: b.id }],
      name: "Creator, B",
    });
    if (!roomResult.success || !roomResult.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();
    const service = new RenameRoomService(roomRepo, fakeSocket.socket);

    const result = await service.execute({
      user: outsider,
      roomId: roomResult.data.id,
      name: "Hijacked Name",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Not a participant of this room");

    await cleanupUser(creator);
    await cleanupUser(b);
    await cleanupUser(outsider);
  });
});
