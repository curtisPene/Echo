import { describe, expect, it, beforeEach } from "vitest";
import { GetMessagesService } from "../../services/getMessagesService";
import { DexieMessagesRepo } from "../../adapters/DexieMessagesRepo";
import { db } from "@/infrastructure/sync/db";
import type { MessageDTO } from "../../domainModels/message";

const MESSAGE: MessageDTO = {
  id: "message-1",
  roomId: "room-1",
  redacted: false,
  sender: { userId: "user-1", firstName: "Ada", lastName: "Lovelace" },
  text: "hello",
  createdAt: "2026-07-20T00:00:00.000Z",
  reactions: [],
  readBy: [],
};

beforeEach(async () => {
  await db.messages.clear();
});

describe("GetMessagesService", () => {
  it("returns every message persisted in Dexie", async () => {
    await db.messages.put(MESSAGE);
    const service = new GetMessagesService(new DexieMessagesRepo());

    const messages = await service.execute();

    expect(messages).toEqual([MESSAGE]);
  });

  it("returns an empty array when Dexie has no messages", async () => {
    const service = new GetMessagesService(new DexieMessagesRepo());

    const messages = await service.execute();

    expect(messages).toEqual([]);
  });
});
