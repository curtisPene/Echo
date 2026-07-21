import { describe, expect, it, beforeEach } from "vitest";
import { SendMessageService } from "../../services/sendMessageService";
import { DexieMessagesRepo } from "../../adapters/DexieMessagesRepo";
import { db } from "@/infrastructure/sync/db";
import type { MessagingSocketApi } from "../../ports/MessagingSocketApi";
import type { MessageDTO } from "../../domainModels/message";

const SENT_MESSAGE: MessageDTO = {
  id: "message-1",
  roomId: "room-1",
  redacted: false,
  sender: { userId: "user-1", firstName: "Ada", lastName: "Lovelace" },
  text: "hello",
  createdAt: "2026-07-20T00:00:00.000Z",
  reactions: [],
  readBy: [],
};

function createFakeMessagingSocketApi(
  overrides: Partial<MessagingSocketApi> = {},
): MessagingSocketApi {
  return {
    async sendMessage() {
      return {
        success: true,
        message: "Message sent successfully",
        data: { message: SENT_MESSAGE },
      };
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.messages.clear();
});

describe("SendMessageService", () => {
  it("sends the message via the socket api and persists it to Dexie", async () => {
    const service = new SendMessageService(
      createFakeMessagingSocketApi(),
      new DexieMessagesRepo(),
    );

    const result = await service.execute({ text: "hello", roomId: "room-1" });

    expect(result).toEqual({
      success: true,
      message: "Message sent successfully",
      data: SENT_MESSAGE,
    });
    expect(await db.messages.get(SENT_MESSAGE.id)).toEqual(SENT_MESSAGE);
  });

  it("surfaces the api's failure message and does not touch Dexie", async () => {
    const messagingSocketApi = createFakeMessagingSocketApi({
      async sendMessage() {
        return { success: false, message: "Unauthorized room access", data: null };
      },
    });
    const service = new SendMessageService(
      messagingSocketApi,
      new DexieMessagesRepo(),
    );

    const result = await service.execute({ text: "hello", roomId: "room-1" });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized room access",
      data: null,
    });
    expect(await db.messages.count()).toBe(0);
  });
});
