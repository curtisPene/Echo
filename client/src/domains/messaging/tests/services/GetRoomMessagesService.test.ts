import { describe, expect, it, beforeEach } from "vitest";
import { GetRoomMessagesService } from "../../services/getRoomMessagesService";
import { DexieMessagesRepo } from "../../adapters/DexieMessagesRepo";
import { db } from "@/infrastructure/sync/db";
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
  deliveredTo: [],
  deliveryStatus: "sent",
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
  deliveredTo: [],
  deliveryStatus: "sent",
};

const messagesRepo = new DexieMessagesRepo();
const service = new GetRoomMessagesService(messagesRepo);

beforeEach(async () => {
  await db.messages.clear();
  await db.messages.bulkPut([ROOM_1_MESSAGE, ROOM_2_MESSAGE]);
});

describe("GetRoomMessagesService", () => {
  it("returns only messages belonging to the given room", async () => {
    const result = await service.execute({ roomId: "room-1" })();

    expect(result).toEqual([ROOM_1_MESSAGE]);
  });

  it("returns an empty array when roomId is null", async () => {
    const result = await service.execute({ roomId: null })();

    expect(result).toEqual([]);
  });

  it("returns an empty array when no messages match the room", async () => {
    const result = await service.execute({ roomId: "room-3" })();

    expect(result).toEqual([]);
  });
});
