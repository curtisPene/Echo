import { describe, expect, it, beforeEach } from "vitest";
import { RenameRoomService } from "../../services/renameRoomService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import type { RoomsApi } from "../../ports/RoomsApi";
import { Room } from "../../entities/room";

const RENAMED_ROOM = Room.hydrate({
  id: "room-1",
  name: "New Room Name",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", status: "accepted" },
  ],
});

function createFakeRoomsApi(overrides: Partial<RoomsApi> = {}): RoomsApi {
  return {
    async create() {
      throw new Error("not used in this test");
    },
    async acceptInvite() {
      throw new Error("not used in this test");
    },
    async addParticipant() {
      throw new Error("not used in this test");
    },
    async rename() {
      return {
        success: true,
        message: "Room renamed successfully",
        data: RENAMED_ROOM,
      };
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.rooms.clear();
});

describe("RenameRoomService", () => {
  it("persists the renamed room to Dexie and returns it on success", async () => {
    const service = new RenameRoomService(
      createFakeRoomsApi(),
      new DexieRoomsRepo(),
    );

    const result = await service.execute({
      roomId: RENAMED_ROOM.id,
      name: "New Room Name",
    });

    expect(result).toEqual({
      success: true,
      message: "Room renamed successfully",
      data: RENAMED_ROOM.toDTO(),
    });
    expect(await db.rooms.get(RENAMED_ROOM.id)).toEqual(RENAMED_ROOM.toDTO());
  });

  it("surfaces the api's failure message and does not touch Dexie", async () => {
    const roomsApi = createFakeRoomsApi({
      async rename() {
        return {
          success: false,
          message: "Not a participant of this room",
          data: null,
        };
      },
    });
    const service = new RenameRoomService(roomsApi, new DexieRoomsRepo());

    const result = await service.execute({
      roomId: RENAMED_ROOM.id,
      name: "New Room Name",
    });

    expect(result).toEqual({
      success: false,
      message: "Not a participant of this room",
      data: null,
    });
    expect(await db.rooms.get(RENAMED_ROOM.id)).toBeUndefined();
  });
});
