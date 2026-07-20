import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { AddUserToRoomsService } from "../../services/AddUserToRoomsService";
import { userRepo } from "../../repo/UserRepo";
import { FindUserIdentitiesService } from "../../services/FindUserIdentitiesService";
import { RoomRepo } from "../../../conversations/repo/mongooseRoomRepo";
import { FindRoomsForUserService } from "../../../conversations/services/FindRoomsForUserService";
import { registerAndLogin, cleanupUser } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

// Not the AuthAndAccessSocket fake - AddUserToRoomsService takes a raw
// socket.io Socket parameter directly, a different shape entirely.
function createFakeSocket() {
  const joinedRooms: string[] = [];

  return {
    join: (room: string) => {
      joinedRooms.push(room);
    },
    joinedRooms,
  };
}

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const addUserToRoomsService = new AddUserToRoomsService(new FindRoomsForUserService(roomRepo));

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("AddUserToRoomsService", () => {
  it("joins the socket to every real room the user is a participant in, plus their personal room", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const room = await createNewRoomService.execute({
      user: a,
      participants: [{ id: b.id }],
      name: "A, B",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const fakeSocket = createFakeSocket();

    const result = await addUserToRoomsService.execute({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket: fakeSocket as any,
      userId: a.id,
    });

    expect(result.success).toBe(true);
    expect(fakeSocket.joinedRooms).toContain(room.data.id);
    expect(fakeSocket.joinedRooms).toContain(`user:${a.id}`);

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("joins only the personal room when the user has no rooms yet", async () => {
    const a = await registerAndLogin("A");
    const fakeSocket = createFakeSocket();

    const result = await addUserToRoomsService.execute({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket: fakeSocket as any,
      userId: a.id,
    });

    expect(result.success).toBe(true);
    expect(fakeSocket.joinedRooms).toEqual([`user:${a.id}`]);

    await cleanupUser(a);
  });
});
