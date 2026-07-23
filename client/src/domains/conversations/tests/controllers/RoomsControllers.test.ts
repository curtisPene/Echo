import { describe, expect, it, beforeEach } from "vitest";
import { RoomsControllers } from "../../controllers/RoomsControllers";
import { AcceptRequestService } from "../../services/acceptRequestService";
import { CreateNewRoomService } from "../../services/createNewRoomService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { User } from "@/domains/authAndAccess/entities/user";
import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";
import type { RoomsApi } from "../../ports/RoomsApi";
import type { RoomDTO } from "../../entities/room";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

function createFakeNotificationsPort(): NotificationsPort {
  return { notify: () => {} };
}

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

const UPDATED_ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    {
      userId: CURRENT_USER.id,
      firstName: "Ada",
      lastName: "Lovelace",
      status: "accepted",
    },
    {
      userId: CONTACT.userId,
      firstName: "Grace",
      lastName: "Hopper",
      status: "accepted",
    },
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
            {
              userId: CURRENT_USER.id,
              firstName: "Ada",
              lastName: "Lovelace",
              status: "accepted",
            },
            {
              userId: CONTACT.userId,
              firstName: "Grace",
              lastName: "Hopper",
              status: "pending",
            },
          ],
        },
      };
    },
    async acceptInvite() {
      return {
        success: true,
        message: "Request accepted successfully",
        data: { roomDeleted: false, room: UPDATED_ROOM },
      };
    },
    ...overrides,
  };
}

function createRoomsControllers(roomsApi: RoomsApi) {
  const roomsRepo = new DexieRoomsRepo();
  return new RoomsControllers(
    new AcceptRequestService(roomsApi, roomsRepo),
    new CreateNewRoomService(roomsApi, roomsRepo),
    createFakeNotificationsPort(),
  );
}

beforeEach(async () => {
  await db.rooms.clear();
  await db.roomUnreadCounts.clear();
  useActiveRoom.setState({ activeRoom: null });
});

describe("RoomsControllers.acceptRequest", () => {
  it("returns success and persists the accepted room to Dexie", async () => {
    const controllers = createRoomsControllers(createFakeRoomsApi());

    const result = await controllers.acceptRequest({
      roomId: UPDATED_ROOM.id,
      isAcceptRequest: true,
    });

    expect(result).toEqual({ success: true });
    expect(await db.rooms.get(UPDATED_ROOM.id)).toEqual(UPDATED_ROOM);
  });

  it("returns success and removes the room from Dexie when declining dissolves it", async () => {
    const roomsApi = createFakeRoomsApi({
      async acceptInvite() {
        return {
          success: true,
          message: "Room deleted successfully",
          data: { roomDeleted: true, roomId: UPDATED_ROOM.id },
        };
      },
    });
    const controllers = createRoomsControllers(roomsApi);
    await db.rooms.put(UPDATED_ROOM);

    const result = await controllers.acceptRequest({
      roomId: UPDATED_ROOM.id,
      isAcceptRequest: false,
    });

    expect(result).toEqual({ success: true });
    expect(await db.rooms.get(UPDATED_ROOM.id)).toBeUndefined();
  });

  it("surfaces the api's failure message", async () => {
    const roomsApi = createFakeRoomsApi({
      async acceptInvite() {
        return { success: false, message: "Room not found", data: null };
      },
    });
    const controllers = createRoomsControllers(roomsApi);

    const result = await controllers.acceptRequest({
      roomId: "nonexistent",
      isAcceptRequest: true,
    });

    expect(result).toEqual({ success: false, message: "Room not found" });
  });
});

describe("RoomsControllers.createRoom", () => {
  it("creates a room, persists it to Dexie, selects it as active, and returns its id/name", async () => {
    const controllers = createRoomsControllers(createFakeRoomsApi());

    const result = await controllers.createRoom({
      user: CURRENT_USER,
      contacts: [CONTACT],
    });

    expect(result).toEqual({
      success: true,
      roomId: "room-2",
      name: "New Room",
    });
    expect(useActiveRoom.getState().activeRoom).toEqual({
      id: "room-2",
      name: "New Room",
      participants: [
        {
          userId: CURRENT_USER.id,
          firstName: "Ada",
          lastName: "Lovelace",
          status: "accepted",
        },
        {
          userId: CONTACT.userId,
          firstName: "Grace",
          lastName: "Hopper",
          status: "pending",
        },
      ],
    });
    expect(await db.rooms.get("room-2")).toBeDefined();
  });

  it("reuses an existing 1:1 room already in Dexie instead of creating a new one", async () => {
    await db.rooms.put(UPDATED_ROOM);
    const roomsApi = createFakeRoomsApi({
      async create() {
        throw new Error(
          "should not create a new room when a 1:1 already exists",
        );
      },
    });
    const controllers = createRoomsControllers(roomsApi);

    const result = await controllers.createRoom({
      user: CURRENT_USER,
      contacts: [CONTACT],
    });

    expect(result).toEqual({
      success: true,
      roomId: UPDATED_ROOM.id,
      name: UPDATED_ROOM.name,
    });
  });

  it("surfaces the api's failure message when room creation fails", async () => {
    const roomsApi = createFakeRoomsApi({
      async create() {
        return {
          success: false,
          message: "One or more participants could not be found",
          data: null,
        };
      },
    });
    const controllers = createRoomsControllers(roomsApi);

    const result = await controllers.createRoom({
      user: CURRENT_USER,
      contacts: [CONTACT],
    });

    expect(result).toEqual({
      success: false,
      message: "One or more participants could not be found",
    });
  });
});
