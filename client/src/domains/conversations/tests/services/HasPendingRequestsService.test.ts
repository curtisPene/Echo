import { describe, expect, it } from "vitest";
import { HasPendingRequestsService } from "../../services/hasPendingRequestsService";
import type { RoomDTO } from "../../entities/room";

const service = new HasPendingRequestsService();

const PENDING_ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", status: "pending" },
  ],
};

const ACCEPTED_ROOM: RoomDTO = {
  id: "room-2",
  name: "Ada, Bob",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-3", firstName: "Bob", lastName: "Smith", status: "accepted" },
  ],
};

describe("HasPendingRequestsService", () => {
  it("returns true when the user has a pending room", () => {
    const result = service.execute({ rooms: [ACCEPTED_ROOM, PENDING_ROOM], userId: "user-2" });

    expect(result).toBe(true);
  });

  it("returns false when the user has no pending rooms", () => {
    const result = service.execute({ rooms: [ACCEPTED_ROOM, PENDING_ROOM], userId: "user-1" });

    expect(result).toBe(false);
  });

  it("returns false when userId is null", () => {
    const result = service.execute({ rooms: [PENDING_ROOM], userId: null });

    expect(result).toBe(false);
  });

  it("defensively treats a user not found in a room as pending", () => {
    const result = service.execute({ rooms: [ACCEPTED_ROOM], userId: "stranger" });

    expect(result).toBe(true);
  });
});
