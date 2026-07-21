import { describe, expect, it, beforeEach } from "vitest";
import { AcceptRequestService } from "../../services/acceptRequestService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import type { RoomsApi } from "../../ports/RoomsApi";
import type { RoomDTO } from "../../entities/room";

const ACCEPTED_ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", status: "accepted" },
  ],
};

function createFakeRoomsApi(overrides: Partial<RoomsApi> = {}): RoomsApi {
  return {
    async create() {
      throw new Error("not used in this test");
    },
    async acceptInvite() {
      return { success: true, message: "Request accepted successfully", data: ACCEPTED_ROOM };
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.rooms.clear();
});

describe("AcceptRequestService", () => {
  it("persists the accepted room to Dexie and returns it on success", async () => {
    const service = new AcceptRequestService(createFakeRoomsApi(), new DexieRoomsRepo());

    const result = await service.execute({ roomId: ACCEPTED_ROOM.id });

    expect(result).toEqual({
      success: true,
      message: "Request accepted successfully",
      data: ACCEPTED_ROOM,
    });
    expect(await db.rooms.get(ACCEPTED_ROOM.id)).toEqual(ACCEPTED_ROOM);
  });

  it("surfaces the api's failure message and does not touch Dexie", async () => {
    const roomsApi = createFakeRoomsApi({
      async acceptInvite() {
        return { success: false, message: "Room not found", data: null };
      },
    });
    const service = new AcceptRequestService(roomsApi, new DexieRoomsRepo());

    const result = await service.execute({ roomId: "nonexistent" });

    expect(result).toEqual({ success: false, message: "Room not found", data: null });
    expect(await db.rooms.get("nonexistent")).toBeUndefined();
  });
});
