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

  it("refreshes the active room's data when it's the room just accepted", async () => {
    // Reproduces a real bug: a currently-open conversation kept showing its
    // stale pre-accept ("pending") state until the user reselected it,
    // even though Dexie/the list had already moved on.
    const controllers = createRoomsControllers(createFakeRoomsApi());
    useActiveRoom.setState({
      activeRoom: {
        id: UPDATED_ROOM.id,
        name: UPDATED_ROOM.toDTO().name,
        participants: [],
      },
    });

    await controllers.acceptRequest({
      roomId: UPDATED_ROOM.id,
      isAcceptRequest: true,
    });

    expect(useActiveRoom.getState().activeRoom).toEqual(UPDATED_ROOM.toDTO());
  });

  it("leaves the active room untouched when a different room is accepted", async () => {
    const controllers = createRoomsControllers(createFakeRoomsApi());
    const otherRoom = {
      id: "some-other-room",
      name: "Unrelated Room",
      participants: [],
    };
    useActiveRoom.setState({ activeRoom: otherRoom });

    await controllers.acceptRequest({
      roomId: UPDATED_ROOM.id,
      isAcceptRequest: true,
    });

    expect(useActiveRoom.getState().activeRoom).toEqual(otherRoom);
  });

  it("clears the active room when it's the one just declined/dissolved", async () => {
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
    useActiveRoom.setState({
      activeRoom: {
        id: UPDATED_ROOM.id,
        name: UPDATED_ROOM.toDTO().name,
        participants: [],
      },
    });

    await controllers.acceptRequest({
      roomId: UPDATED_ROOM.id,
      isAcceptRequest: false,
    });

    expect(useActiveRoom.getState().activeRoom).toBeNull();
  });
});
