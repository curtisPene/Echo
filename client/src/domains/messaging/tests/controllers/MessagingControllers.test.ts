import { describe, expect, it, beforeEach } from "vitest";
import { MessagingControllers } from "../../controllers/MessagingControllers";
import { SendMessageService } from "../../services/sendMessageService";
import { MessageReceiveService } from "../../services/messageReceiveService";
import { DexieMessagesRepo } from "../../adapters/DexieMessagesRepo";
import { db } from "@/infrastructure/sync/db";
import type { MessagingSocketApi } from "../../ports/MessagingSocketApi";
import type { MessageDTO } from "../../entities/message";

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

function createMessagingControllers(messagingSocketApi: MessagingSocketApi) {
  const messagesRepo = new DexieMessagesRepo();
  return new MessagingControllers(
    new SendMessageService(messagingSocketApi, messagesRepo),
    new MessageReceiveService(messagesRepo),
  );
}

beforeEach(async () => {
  await db.messages.clear();
});

describe("MessagingControllers.sendMessage", () => {
  it("returns success when the message sends", async () => {
    const controllers = createMessagingControllers(createFakeMessagingSocketApi());

    const result = await controllers.sendMessage({ text: "hello", roomId: "room-1" });

    expect(result).toEqual({ success: true });
    expect(await db.messages.get(SENT_MESSAGE.id)).toEqual(SENT_MESSAGE);
  });

  it("surfaces the api's failure message", async () => {
    const messagingSocketApi = createFakeMessagingSocketApi({
      async sendMessage() {
        return { success: false, message: "Unauthorized room access", data: null };
      },
    });
    const controllers = createMessagingControllers(messagingSocketApi);

    const result = await controllers.sendMessage({ text: "hello", roomId: "room-1" });

    expect(result).toEqual({ success: false, message: "Unauthorized room access" });
  });
});

describe("MessagingControllers.onMessageReceive", () => {
  it("persists the received message to Dexie", async () => {
    const controllers = createMessagingControllers(createFakeMessagingSocketApi());

    await controllers.onMessageReceive({
      success: true,
      message: "Message received",
      data: { message: SENT_MESSAGE },
    });

    expect(await db.messages.get(SENT_MESSAGE.id)).toEqual(SENT_MESSAGE);
  });

  it("does nothing when the server reports failure", async () => {
    const controllers = createMessagingControllers(createFakeMessagingSocketApi());

    await controllers.onMessageReceive({
      success: false,
      message: "Something went wrong",
      data: null,
    });

    expect(await db.messages.get(SENT_MESSAGE.id)).toBeUndefined();
  });
});
