import { describe, expect, it, beforeEach } from "vitest";
import { GetConversationDetailsService } from "../../services/getConversationDetailsService";
import { DexieRoomsRepo } from "../../adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import type { RoomDTO } from "../../entities/room";

const ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", status: "accepted" },
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", email: "grace@example.com", status: "pending" },
  ],
};

const service = new GetConversationDetailsService(new DexieRoomsRepo());

beforeEach(async () => {
  await db.rooms.clear();
  await db.rooms.put(ROOM);
});

describe("GetConversationDetailsService", () => {
  it("returns the active room, hydrated as a real Room instance", async () => {
    const result = await service.execute({ activeRoomId: ROOM.id })();

    expect(result).toBeDefined();
    expect(result?.id).toBe(ROOM.id);
    expect(result?.isOneOnOne()).toBe(true);
  });

  it("returns undefined when there is no active room", async () => {
    const result = await service.execute({ activeRoomId: null })();

    expect(result).toBeUndefined();
  });

  it("returns undefined when the active room id doesn't match any room", async () => {
    const result = await service.execute({ activeRoomId: "nonexistent" })();

    expect(result).toBeUndefined();
  });
});
