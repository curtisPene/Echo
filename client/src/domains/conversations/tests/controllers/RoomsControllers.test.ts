import { describe, expect, it, beforeEach } from "vitest";
import { RoomsControllers } from "../../controllers/RoomsControllers";
import { AcceptRequestService } from "../../services/acceptRequestService";
import { CreateNewRoomService } from "../../services/createNewRoomService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import { useRooms } from "@/stores/useRooms";
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

const ACCEPTED_ROOM: RoomDTO = {
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
      return { success: true, message: "Request accepted successfully", data: ACCEPTED_ROOM };
    },
    ...overrides,
  };
}

function createRoomsControllers(roomsApi: RoomsApi) {
  const roomsRepo = new DexieRoomsRepo();
  return new RoomsControllers(
    new AcceptRequestService(roomsApi, roomsRepo),
    new CreateNewRoomService(roomsApi, roomsRepo),
  );
}

beforeEach(async () => {
  await db.rooms.clear();
  await db.roomUnreadCounts.clear();
  useRooms.setState({ activeRoom: null, rooms: [] });
});

describe("RoomsControllers.acceptRequest", () => {
  it("returns success and persists the accepted room to Dexie", async () => {
    const controllers = createRoomsControllers(createFakeRoomsApi());

    const result = await controllers.acceptRequest({ roomId: ACCEPTED_ROOM.id });

    expect(result).toEqual({ success: true });
    expect(await db.rooms.get(ACCEPTED_ROOM.id)).toEqual(ACCEPTED_ROOM);
  });

  it("surfaces the api's failure message", async () => {
    const roomsApi = createFakeRoomsApi({
      async acceptInvite() {
        return { success: false, message: "Room not found", data: null };
      },
    });
    const controllers = createRoomsControllers(roomsApi);

    const result = await controllers.acceptRequest({ roomId: "nonexistent" });

    expect(result).toEqual({ success: false, message: "Room not found" });
  });
});

describe("RoomsControllers.createRoom", () => {
  it("creates a room, persists it to Dexie, selects it as active, and returns its id/name", async () => {
    const controllers = createRoomsControllers(createFakeRoomsApi());

    const result = await controllers.createRoom({ user: CURRENT_USER, contacts: [CONTACT] });

    expect(result).toEqual({ success: true, roomId: "room-2", name: "New Room" });
    expect(useRooms.getState().activeRoom).toEqual({
      id: "room-2",
      name: "New Room",
      participants: [
        { userId: CURRENT_USER.id, firstName: "Ada", lastName: "Lovelace", status: "accepted" },
        { userId: CONTACT.userId, firstName: "Grace", lastName: "Hopper", status: "pending" },
      ],
    });
    expect(await db.rooms.get("room-2")).toBeDefined();
  });

  it("reuses an existing 1:1 room already in Dexie instead of creating a new one", async () => {
    await db.rooms.put(ACCEPTED_ROOM);
    const roomsApi = createFakeRoomsApi({
      async create() {
        throw new Error("should not create a new room when a 1:1 already exists");
      },
    });
    const controllers = createRoomsControllers(roomsApi);

    const result = await controllers.createRoom({ user: CURRENT_USER, contacts: [CONTACT] });

    expect(result).toEqual({ success: true, roomId: ACCEPTED_ROOM.id, name: ACCEPTED_ROOM.name });
  });

  it("surfaces the api's failure message when room creation fails", async () => {
    const roomsApi = createFakeRoomsApi({
      async create() {
        return { success: false, message: "One or more participants could not be found", data: null };
      },
    });
    const controllers = createRoomsControllers(roomsApi);

    const result = await controllers.createRoom({ user: CURRENT_USER, contacts: [CONTACT] });

    expect(result).toEqual({
      success: false,
      message: "One or more participants could not be found",
    });
  });
});
