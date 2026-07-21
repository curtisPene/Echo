import { describe, expect, it, beforeEach } from "vitest";
import { CreateNewRoomService } from "../../services/createNewRoomService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import { User } from "@/domains/authAndAccess/domainModels/user";
import type { ContactDTO } from "@/domains/authAndAccess/domainModels/contacts";
import type { RoomsApi } from "../../ports/RoomsApi";
import type { RoomDTO } from "../../domainModels/room";

const CURRENT_USER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

const CONTACT: ContactDTO = {
  userId: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
};

const EXISTING_ONE_ON_ONE_ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    { userId: CURRENT_USER.id, firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: CONTACT.userId, firstName: "Grace", lastName: "Hopper", status: "accepted" },
  ],
};

function createFakeRoomsApi(overrides: Partial<RoomsApi> = {}): RoomsApi {
  return {
    async create() {
      return {
        success: true,
        message: "Room created successfully",
        data: {
          id: "room-2",
          name: "New Room",
          participants: [
            { userId: CURRENT_USER.id, firstName: "Ada", lastName: "Lovelace", status: "accepted" },
            { userId: CONTACT.userId, firstName: "Grace", lastName: "Hopper", status: "pending" },
          ],
        },
      };
    },
    async acceptInvite() {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.rooms.clear();
});

describe("CreateNewRoomService", () => {
  it("creates a new room via the api and persists it to Dexie", async () => {
    const service = new CreateNewRoomService(createFakeRoomsApi(), new DexieRoomsRepo());

    const result = await service.execute({ user: CURRENT_USER, contacts: [CONTACT] });

    expect(result).toEqual({
      success: true,
      message: "Room created successfully",
      data: {
        id: "room-2",
        name: "New Room",
        participants: [
          { userId: CURRENT_USER.id, firstName: "Ada", lastName: "Lovelace", status: "accepted" },
          { userId: CONTACT.userId, firstName: "Grace", lastName: "Hopper", status: "pending" },
        ],
      },
    });
    expect(await db.rooms.get("room-2")).toBeDefined();
  });

  it("reuses an existing 1:1 room already in Dexie instead of calling the api", async () => {
    await db.rooms.put(EXISTING_ONE_ON_ONE_ROOM);
    const roomsApi = createFakeRoomsApi({
      async create() {
        throw new Error("should not create a new room when a 1:1 already exists");
      },
    });
    const service = new CreateNewRoomService(roomsApi, new DexieRoomsRepo());

    const result = await service.execute({ user: CURRENT_USER, contacts: [CONTACT] });

    expect(result).toEqual({
      success: true,
      message: "Room already exists",
      data: EXISTING_ONE_ON_ONE_ROOM,
    });
  });

  it("does not reuse an existing room when creating a group (more than one contact)", async () => {
    await db.rooms.put(EXISTING_ONE_ON_ONE_ROOM);
    const roomsApi = createFakeRoomsApi();
    const service = new CreateNewRoomService(roomsApi, new DexieRoomsRepo());
    const secondContact: ContactDTO = {
      userId: "user-3",
      firstName: "Grace2",
      lastName: "Hopper2",
      email: "grace2@example.com",
    };

    const result = await service.execute({
      user: CURRENT_USER,
      contacts: [CONTACT, secondContact],
    });

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("room-2");
  });

  it("surfaces the api's failure message and does not touch Dexie", async () => {
    const roomsApi = createFakeRoomsApi({
      async create() {
        return {
          success: false,
          message: "One or more participants could not be found",
          data: null,
        };
      },
    });
    const service = new CreateNewRoomService(roomsApi, new DexieRoomsRepo());

    const result = await service.execute({ user: CURRENT_USER, contacts: [CONTACT] });

    expect(result).toEqual({
      success: false,
      message: "One or more participants could not be found",
      data: null,
    });
    expect(await db.rooms.count()).toBe(0);
  });
});
