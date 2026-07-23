import { describe, expect, it, beforeEach } from "vitest";
import { SendMessageService } from "../../services/sendMessageService";
import { DexieMessagesRepo } from "../../adapters/DexieMessagesRepo";
import { db } from "@/infrastructure/sync/db";
import { User } from "@/domains/authAndAccess/entities/user";
import type { MessagingSocketApi } from "../../ports/MessagingSocketApi";
import type { MessageDTO } from "../../entities/message";

const SENDER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

const SENT_MESSAGE: MessageDTO = {
  id: "message-1",
  roomId: "room-1",
  redacted: false,
  sender: { userId: SENDER.id, firstName: "Ada", lastName: "Lovelace" },
  text: "hello",
  createdAt: "2026-07-20T00:00:00.000Z",
  reactions: [],
  readBy: [],
  deliveredTo: [],
  deliveryStatus: "sent",
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
    async confirmDelivery() {
      throw new Error("not used in this test");
    },
    async confirmRead() {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.messages.clear();
});

describe("SendMessageService", () => {
  it("writes an optimistic 'sending' message to Dexie before the socket call resolves", async () => {
    let resolveSend!: (value: Awaited<ReturnType<MessagingSocketApi["sendMessage"]>>) => void;
    const sendPromise = new Promise<
      Awaited<ReturnType<MessagingSocketApi["sendMessage"]>>
    >((resolve) => {
      resolveSend = resolve;
    });
    const messagingSocketApi = createFakeMessagingSocketApi({
      sendMessage: () => sendPromise,
    });
    const service = new SendMessageService(
      messagingSocketApi,
      new DexieMessagesRepo(),
    );

    const executePromise = service.execute({
      text: "hello",
      roomId: "room-1",
      sender: SENDER,
    });

    // Give the optimistic write's own await a tick to land before the
    // socket call resolves.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const allMessages = await db.messages.toArray();
    expect(allMessages).toHaveLength(1);
    expect(allMessages[0].text).toBe("hello");
    expect(allMessages[0].deliveryStatus).toBe("sending");
    expect(allMessages[0].sender?.userId).toBe(SENDER.id);
    const tempId = allMessages[0].id;
    expect(tempId).not.toBe(SENT_MESSAGE.id);

    resolveSend({
      success: true,
      message: "Message sent successfully",
      data: { message: SENT_MESSAGE },
    });
    await executePromise;

    expect(await db.messages.get(tempId)).toBeUndefined();
    expect(await db.messages.get(SENT_MESSAGE.id)).toEqual(SENT_MESSAGE);
  });

  it("sends the message via the socket api and replaces the optimistic copy with the real one", async () => {
    const service = new SendMessageService(
      createFakeMessagingSocketApi(),
      new DexieMessagesRepo(),
    );

    const result = await service.execute({
      text: "hello",
      roomId: "room-1",
      sender: SENDER,
    });

    expect(result).toEqual({
      success: true,
      message: "Message sent successfully",
      data: SENT_MESSAGE,
    });

    const allMessages = await db.messages.toArray();
    expect(allMessages).toHaveLength(1);
    expect(allMessages[0]).toEqual(SENT_MESSAGE);
  });

  it("marks the optimistic message as 'failed' (not deleted) when the api reports failure", async () => {
    const messagingSocketApi = createFakeMessagingSocketApi({
      async sendMessage() {
        return { success: false, message: "Unauthorized room access", data: null };
      },
    });
    const service = new SendMessageService(
      messagingSocketApi,
      new DexieMessagesRepo(),
    );

    const result = await service.execute({
      text: "hello",
      roomId: "room-1",
      sender: SENDER,
    });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized room access",
      data: null,
    });

    const allMessages = await db.messages.toArray();
    expect(allMessages).toHaveLength(1);
    expect(allMessages[0].deliveryStatus).toBe("failed");
    expect(allMessages[0].text).toBe("hello");
  });

  it("marks the optimistic message as 'failed' when the socket call throws", async () => {
    const messagingSocketApi = createFakeMessagingSocketApi({
      async sendMessage() {
        throw new Error("network down");
      },
    });
    const service = new SendMessageService(
      messagingSocketApi,
      new DexieMessagesRepo(),
    );

    const result = await service.execute({
      text: "hello",
      roomId: "room-1",
      sender: SENDER,
    });

    expect(result.success).toBe(false);

    const allMessages = await db.messages.toArray();
    expect(allMessages).toHaveLength(1);
    expect(allMessages[0].deliveryStatus).toBe("failed");
  });
});
