import { describe, expect, it, beforeEach } from "vitest";
import { AddParticipantToRoomService } from "../../services/addParticipantToRoomService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import type { RoomsApi } from "../../ports/RoomsApi";
import { Room } from "../../entities/room";

const UPDATED_ROOM = Room.hydrate({
  id: "room-1",
  name: "Ada, Grace, Alan",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", status: "accepted" },
    { userId: "user-3", firstName: "Alan", lastName: "Turing", status: "pending" },
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
      return {
        success: true,
        message: "Participant added successfully",
        data: UPDATED_ROOM,
      };
    },
    async rename() {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.rooms.clear();
});

describe("AddParticipantToRoomService", () => {
  it("persists the updated room to Dexie and returns it on success", async () => {
    const service = new AddParticipantToRoomService(
      createFakeRoomsApi(),
      new DexieRoomsRepo(),
    );

    const result = await service.execute({
      roomId: UPDATED_ROOM.id,
      participantId: "user-3",
    });

    expect(result).toEqual({
      success: true,
      message: "Participant added successfully",
      data: UPDATED_ROOM.toDTO(),
    });
    expect(await db.rooms.get(UPDATED_ROOM.id)).toEqual(UPDATED_ROOM.toDTO());
  });

  it("surfaces the api's failure message and does not touch Dexie", async () => {
    const roomsApi = createFakeRoomsApi({
      async addParticipant() {
        return {
          success: false,
          message: "This user has blocked someone already in this conversation",
          data: null,
        };
      },
    });
    const service = new AddParticipantToRoomService(roomsApi, new DexieRoomsRepo());

    const result = await service.execute({
      roomId: UPDATED_ROOM.id,
      participantId: "user-3",
    });

    expect(result).toEqual({
      success: false,
      message: "This user has blocked someone already in this conversation",
      data: null,
    });
    expect(await db.rooms.get(UPDATED_ROOM.id)).toBeUndefined();
  });
});
