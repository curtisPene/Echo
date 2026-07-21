import { describe, expect, it, beforeEach } from "vitest";
import { MessageReceiveService } from "../../services/messageReceiveService";
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

describe("MessageReceiveService", () => {
  it("persists the received message to Dexie", async () => {
    const service = new MessageReceiveService(new DexieMessagesRepo());

    await service.execute({ message: MESSAGE });

    expect(await db.messages.get(MESSAGE.id)).toEqual(MESSAGE);
  });

  it("persists the message regardless of the room's status for the current user", async () => {
    const service = new MessageReceiveService(new DexieMessagesRepo());
    const redacted: MessageDTO = {
      id: "message-2",
      roomId: "room-1",
      redacted: true,
      sender: null,
      text: null,
      createdAt: "2026-07-20T00:01:00.000Z",
      reactions: null,
      readBy: null,
    };

    await service.execute({ message: redacted });

    expect(await db.messages.get(redacted.id)).toEqual(redacted);
  });
});
