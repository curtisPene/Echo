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

describe("RoomsControllers.addParticipant", () => {
  it("returns success and persists the updated room to Dexie", async () => {
    const controllers = createRoomsControllers(createFakeRoomsApi());

    const result = await controllers.addParticipant({
      roomId: UPDATED_ROOM.id,
      participantId: "user-3",
    });

    expect(result).toEqual({ success: true });
    expect(await db.rooms.get(UPDATED_ROOM.id)).toEqual(UPDATED_ROOM.toDTO());
  });

  it("surfaces the api's failure message", async () => {
    const roomsApi = createFakeRoomsApi({
      async addParticipant() {
        return {
          success: false,
          message: "This user has blocked someone already in this conversation",
          data: null,
        };
      },
    });
    const controllers = createRoomsControllers(roomsApi);

    const result = await controllers.addParticipant({
      roomId: UPDATED_ROOM.id,
      participantId: "user-3",
    });

    expect(result).toEqual({
      success: false,
      message: "This user has blocked someone already in this conversation",
    });
  });
});
