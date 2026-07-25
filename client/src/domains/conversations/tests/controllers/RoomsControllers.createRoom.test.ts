import { describe, expect, it, beforeEach } from "vitest";
import { db } from "@/infrastructure/sync/db";
import { useActiveRoom } from "@/stores/useActiveRoom";
import {
  CURRENT_USER,
  CONTACT,
  UPDATED_ROOM,
  createFakeRoomsApi,
  createRoomsControllers,
} from "../testHelpers";

beforeEach(async () => {
  await db.rooms.clear();
  await db.roomUnreadCounts.clear();
  useActiveRoom.setState({ activeRoom: null });
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
          email: CURRENT_USER.email,
          status: "accepted",
        },
        {
          userId: CONTACT.userId,
          firstName: "Grace",
          lastName: "Hopper",
          email: CONTACT.email,
          status: "pending",
        },
      ],
    });
    expect(await db.rooms.get("room-2")).toBeDefined();
  });

  it("reuses an existing 1:1 room already in Dexie instead of creating a new one", async () => {
    await db.rooms.put(UPDATED_ROOM.toDTO());
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
