import { describe, expect, it, beforeEach } from "vitest";
import { db } from "@/infrastructure/sync/db";
import { useActiveRoom } from "@/stores/useActiveRoom";
import {
  UPDATED_ROOM,
  createFakeRoomsApi,
  createRoomsControllers,
} from "../testHelpers";

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
    expect(await db.rooms.get(UPDATED_ROOM.id)).toEqual(UPDATED_ROOM.toDTO());
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
    await db.rooms.put(UPDATED_ROOM.toDTO());

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
