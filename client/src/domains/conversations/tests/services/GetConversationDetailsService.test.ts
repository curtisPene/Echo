import { describe, expect, it } from "vitest";
import { GetConversationDetailsService } from "../../services/getConversationDetailsService";
import type { RoomDTO } from "../../entities/room";

const service = new GetConversationDetailsService();

const ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", status: "pending" },
  ],
};

describe("GetConversationDetailsService", () => {
  it("returns the active room's DTO", () => {
    const result = service.execute({
      rooms: [ROOM],
      activeRoomId: ROOM.id,
    });

    expect(result).toEqual(ROOM);
  });

  it("returns null when there is no active room", () => {
    const result = service.execute({
      rooms: [ROOM],
      activeRoomId: null,
    });

    expect(result).toBeNull();
  });

  it("returns null when the active room id doesn't match any room", () => {
    const result = service.execute({
      rooms: [ROOM],
      activeRoomId: "nonexistent",
    });

    expect(result).toBeNull();
  });
});
