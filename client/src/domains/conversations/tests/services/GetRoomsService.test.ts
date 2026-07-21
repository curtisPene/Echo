import { describe, expect, it, beforeEach } from "vitest";
import { GetRoomsService } from "../../services/getRoomsService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import type { RoomDTO } from "../../domainModels/room";

const ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", status: "pending" },
  ],
};

beforeEach(async () => {
  await db.rooms.clear();
});

describe("GetRoomsService", () => {
  it("returns every room persisted in Dexie, hydrated as real Room instances", async () => {
    await db.rooms.put(ROOM);
    const service = new GetRoomsService(new DexieRoomsRepo());

    const rooms = await service.execute();

    expect(rooms).toHaveLength(1);
    expect(rooms[0].id).toBe(ROOM.id);
    expect(rooms[0].isOneOnOne()).toBe(true);
    expect(rooms[0].hasParticipant("user-2")).toBe(true);
  });

  it("returns an empty array when Dexie has no rooms", async () => {
    const service = new GetRoomsService(new DexieRoomsRepo());

    const rooms = await service.execute();

    expect(rooms).toEqual([]);
  });
});
