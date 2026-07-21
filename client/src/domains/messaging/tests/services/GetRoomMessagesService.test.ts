import { describe, expect, it } from "vitest";
import { GetRoomMessagesService } from "../../services/getRoomMessagesService";
import type { MessageDTO } from "../../entities/message";

const ROOM_1_MESSAGE: MessageDTO = {
  id: "message-1",
  roomId: "room-1",
  redacted: false,
  sender: { userId: "user-1", firstName: "Ada", lastName: "Lovelace" },
  text: "hello",
  createdAt: "2026-07-20T00:00:00.000Z",
  reactions: [],
  readBy: [],
};

const ROOM_2_MESSAGE: MessageDTO = {
  id: "message-2",
  roomId: "room-2",
  redacted: false,
  sender: { userId: "user-2", firstName: "Grace", lastName: "Hopper" },
  text: "hi",
  createdAt: "2026-07-20T00:01:00.000Z",
  reactions: [],
  readBy: [],
};

describe("GetRoomMessagesService", () => {
  const service = new GetRoomMessagesService();

  it("returns only messages belonging to the given room", () => {
    const result = service.execute({
      messages: [ROOM_1_MESSAGE, ROOM_2_MESSAGE],
      roomId: "room-1",
    });

    expect(result).toEqual([ROOM_1_MESSAGE]);
  });

  it("returns an empty array when roomId is null", () => {
    const result = service.execute({
      messages: [ROOM_1_MESSAGE, ROOM_2_MESSAGE],
      roomId: null,
    });

    expect(result).toEqual([]);
  });

  it("returns an empty array when no messages match the room", () => {
    const result = service.execute({
      messages: [ROOM_1_MESSAGE],
      roomId: "room-3",
    });

    expect(result).toEqual([]);
  });
});
