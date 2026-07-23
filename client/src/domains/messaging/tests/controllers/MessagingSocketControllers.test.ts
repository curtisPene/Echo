import { describe, expect, it, beforeEach } from "vitest";
import { MessagingSocketControllers } from "../../controllers/MessagingSocketControllers";
import { SendMessageService } from "../../services/sendMessageService";
import { MessageReceiveService } from "../../services/messageReceiveService";
import { ConfirmMessageDeliveryService } from "../../services/confirmMessageDeliveryService";
import { ConfirmMessageReadService } from "../../services/confirmMessageReadService";
import { DexieMessagesRepo } from "../../adapters/DexieMessagesRepo";
import { db } from "@/infrastructure/sync/db";
import { useAuth } from "@/stores/useAuth";
import { useSocketState } from "@/stores/useSocket";
import { User } from "@/domains/authAndAccess/entities/user";
import type { MessagingSocketApi } from "../../ports/MessagingSocketApi";
import type { MessageDTO } from "../../entities/message";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

function createFakeNotificationsPort(): NotificationsPort {
  return { notify: () => {} };
}

const AUTHENTICATED_USER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

const SENT_MESSAGE: MessageDTO = {
  id: "message-1",
  roomId: "room-1",
  redacted: false,
  sender: { userId: AUTHENTICATED_USER.id, firstName: "Ada", lastName: "Lovelace" },
  text: "hello",
  createdAt: "2026-07-20T00:00:00.000Z",
  reactions: [],
  readBy: [],
  deliveredTo: [],
  deliveryStatus: "sent",
};

const OTHER_USER_MESSAGE: MessageDTO = {
  id: "message-2",
  roomId: "room-1",
  redacted: false,
  sender: { userId: "user-2", firstName: "Grace", lastName: "Hopper" },
  text: "hi from someone else",
  createdAt: "2026-07-20T00:00:01.000Z",
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
    async confirmDelivery({ messageId }) {
      return {
        success: true,
        message: "Delivery confirmed successfully",
        data: {
          message: {
            ...OTHER_USER_MESSAGE,
            id: messageId,
            deliveredTo: [AUTHENTICATED_USER.id],
            deliveryStatus: "delivered",
          },
        },
      };
    },
    async confirmRead({ messageId }) {
      const message: MessageDTO = {
        ...(OTHER_USER_MESSAGE as Extract<MessageDTO, { redacted: false }>),
        id: messageId,
        readBy: [{ userId: AUTHENTICATED_USER.id, readAt: "2026-07-20T00:00:02.000Z" }],
        deliveryStatus: "read",
      };
      return {
        success: true,
        message: "Read confirmed successfully",
        data: { message },
      };
    },
    ...overrides,
  };
}

function createMessagingSocketControllers(messagingSocketApi: MessagingSocketApi) {
  const messagesRepo = new DexieMessagesRepo();
  return new MessagingSocketControllers(
    new SendMessageService(messagingSocketApi, messagesRepo),
    new MessageReceiveService(messagesRepo),
    new ConfirmMessageDeliveryService(messagingSocketApi, messagesRepo),
    new ConfirmMessageReadService(messagingSocketApi, messagesRepo),
    createFakeNotificationsPort(),
  );
}

beforeEach(async () => {
  await db.messages.clear();
});

describe("MessagingSocketControllers.sendMessage", () => {
  beforeEach(() => {
    useAuth.setState({
      authStatus: "authenticated",
      user: AUTHENTICATED_USER,
      accessToken: "fake-access-token",
    });
    useSocketState.setState({ onlineStatus: "online" });
  });

  it("rejects sending when not authenticated", async () => {
    useAuth.setState({ authStatus: "unauthenticated", user: null });
    const controllers = createMessagingSocketControllers(
      createFakeMessagingSocketApi(),
    );

    const result = await controllers.sendMessage({
      text: "hello",
      roomId: "room-1",
    });

    expect(result).toEqual({
      success: false,
      message: "Unable to send message right now",
    });
  });

  it("rejects sending when not online", async () => {
    useSocketState.setState({ onlineStatus: "offline" });
    const controllers = createMessagingSocketControllers(
      createFakeMessagingSocketApi(),
    );

    const result = await controllers.sendMessage({
      text: "hello",
      roomId: "room-1",
    });

    expect(result).toEqual({
      success: false,
      message: "Unable to send message right now",
    });
  });

  it("returns success when the message sends", async () => {
    const controllers = createMessagingSocketControllers(
      createFakeMessagingSocketApi(),
    );

    const result = await controllers.sendMessage({
      text: "hello",
      roomId: "room-1",
    });

    expect(result).toEqual({ success: true });
    expect(await db.messages.get(SENT_MESSAGE.id)).toEqual(SENT_MESSAGE);
  });

  it("surfaces the api's failure message", async () => {
    const messagingSocketApi = createFakeMessagingSocketApi({
      async sendMessage() {
        return {
          success: false,
          message: "Unauthorized room access",
          data: null,
        };
      },
    });
    const controllers = createMessagingSocketControllers(messagingSocketApi);

    const result = await controllers.sendMessage({
      text: "hello",
      roomId: "room-1",
    });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized room access",
    });
  });
});

describe("MessagingSocketControllers.onMessageReceive", () => {
  beforeEach(() => {
    useAuth.setState({
      authStatus: "authenticated",
      user: AUTHENTICATED_USER,
      accessToken: "fake-access-token",
    });
  });

  it("persists the received message to Dexie", async () => {
    const controllers = createMessagingSocketControllers(
      createFakeMessagingSocketApi(),
    );
    const alreadyDeliveredMessage: MessageDTO = {
      ...SENT_MESSAGE,
      deliveredTo: [AUTHENTICATED_USER.id],
      deliveryStatus: "delivered",
    };

    await controllers.onMessageReceive({
      success: true,
      message: "Message received",
      data: { message: alreadyDeliveredMessage },
    });

    expect(await db.messages.get(alreadyDeliveredMessage.id)).toEqual(
      alreadyDeliveredMessage,
    );
  });

  it("does nothing when the server reports failure", async () => {
    const controllers = createMessagingSocketControllers(
      createFakeMessagingSocketApi(),
    );

    await controllers.onMessageReceive({
      success: false,
      message: "Something went wrong",
      data: null,
    });

    expect(await db.messages.get(SENT_MESSAGE.id)).toBeUndefined();
  });

  it("does NOT confirm delivery when this user is already in deliveredTo (any device, including a re-receive of your own message)", async () => {
    let confirmDeliveryCalled = false;
    const messagingSocketApi = createFakeMessagingSocketApi({
      async confirmDelivery() {
        confirmDeliveryCalled = true;
        return {
          success: true,
          message: "Delivery confirmed successfully",
          data: { message: SENT_MESSAGE },
        };
      },
    });
    const controllers = createMessagingSocketControllers(messagingSocketApi);
    const alreadyDeliveredMessage: MessageDTO = {
      ...SENT_MESSAGE,
      deliveredTo: [AUTHENTICATED_USER.id],
      deliveryStatus: "delivered",
    };

    await controllers.onMessageReceive({
      success: true,
      message: "Message received",
      data: { message: alreadyDeliveredMessage },
    });

    expect(confirmDeliveryCalled).toBe(false);
  });

  it("DOES confirm delivery for your own sent message from another device that hasn't confirmed yet", async () => {
    let confirmDeliveryCalled = false;
    const messagingSocketApi = createFakeMessagingSocketApi({
      async confirmDelivery() {
        confirmDeliveryCalled = true;
        return {
          success: true,
          message: "Delivery confirmed successfully",
          data: {
            message: {
              ...SENT_MESSAGE,
              deliveredTo: [AUTHENTICATED_USER.id],
              deliveryStatus: "delivered",
            },
          },
        };
      },
    });
    const controllers = createMessagingSocketControllers(messagingSocketApi);

    // SENT_MESSAGE's own deliveredTo starts empty - even though it's this
    // user's own message, a second device receiving this same broadcast has
    // not yet confirmed it locally, so it must confirm rather than being
    // skipped just because sender.userId matches the current user.
    await controllers.onMessageReceive({
      success: true,
      message: "Message received",
      data: { message: SENT_MESSAGE },
    });

    expect(confirmDeliveryCalled).toBe(true);
  });

  it("confirms delivery and persists the updated status for someone ELSE's message", async () => {
    const controllers = createMessagingSocketControllers(
      createFakeMessagingSocketApi(),
    );

    await controllers.onMessageReceive({
      success: true,
      message: "Message received",
      data: { message: OTHER_USER_MESSAGE },
    });

    const stored = await db.messages.get(OTHER_USER_MESSAGE.id);
    expect(stored?.deliveryStatus).toBe("delivered");
    expect(stored?.deliveredTo).toEqual([AUTHENTICATED_USER.id]);
  });

  it("does not attempt to confirm delivery for a redacted message", async () => {
    let confirmDeliveryCalled = false;
    const messagingSocketApi = createFakeMessagingSocketApi({
      async confirmDelivery() {
        confirmDeliveryCalled = true;
        return {
          success: true,
          message: "Delivery confirmed successfully",
          data: { message: SENT_MESSAGE },
        };
      },
    });
    const controllers = createMessagingSocketControllers(messagingSocketApi);

    const redactedMessage: MessageDTO = {
      id: "message-3",
      roomId: "room-1",
      redacted: true,
      sender: null,
      text: null,
      createdAt: "2026-07-20T00:00:02.000Z",
      reactions: null,
      readBy: null,
      deliveredTo: [],
      deliveryStatus: "sent",
    };

    await controllers.onMessageReceive({
      success: true,
      message: "Message received",
      data: { message: redactedMessage },
    });

    expect(confirmDeliveryCalled).toBe(false);
  });
});
