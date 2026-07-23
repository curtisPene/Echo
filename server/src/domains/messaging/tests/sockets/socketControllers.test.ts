import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import { attachSocket } from "../../../../socket";
import * as composition from "../../../../composition";
import { mongooseConnect } from "../../../../server";
import {
  registerAndLogin,
  cleanupUser,
  createFakePresenceRepo,
  createFakeSocket,
} from "../../../authAndAccess/tests/testHelpers";
import { UserConnectedService } from "../../../presence/services/UserConnectedService";
import { UserDisconnectedService } from "../../../presence/services/UserDisconnectedService";
import { loginService, createNewRoomService } from "../../../../composition";
import type { MessageDTO } from "../../entities/message";
import type { ServiceResult } from "../../../../types";
import mongoose from "mongoose";

const PASSWORD = "Password1!";

let port: number;
let httpServer: ReturnType<typeof createServer>;

async function connectAuthedSocket(email: string): Promise<ClientSocket> {
  const login = await loginService.execute({ email, password: PASSWORD });
  expect(login.success).toBe(true);
  if (!login.success) throw new Error("unreachable");

  const socket = ioClient(`http://localhost:${port}`, {
    auth: { accessToken: login.data.accessToken },
    transports: ["websocket"],
    forceNew: true,
  });

  await new Promise<void>((resolve, reject) => {
    socket.on("connect", () => resolve());
    socket.on("connect_error", (err) => reject(err));
  });

  // Room-joins happen async on connect (registerAuthSocketHandlers) - give
  // the server a beat to finish joining this socket to its real rooms
  // before the test emits into one.
  await new Promise((resolve) => setTimeout(resolve, 100));

  return socket;
}

beforeAll(async () => {
  await mongooseConnect();

  httpServer = createServer();
  const { repo: fakePresenceRepo } = createFakePresenceRepo();
  const { socket: fakeAuthAndAccessSocket } = createFakeSocket();
  attachSocket(
    httpServer,
    composition.verifyAccessTokenService,
    composition.addUserToRoomsService,
    composition.messagingControllers,
    new UserConnectedService(
      fakePresenceRepo,
      fakeAuthAndAccessSocket,
      composition.getUsersContactsService,
    ),
    new UserDisconnectedService(
      fakePresenceRepo,
      fakeAuthAndAccessSocket,
      composition.getUsersContactsService,
    ),
  );

  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => {
      const address = httpServer.address();
      if (address && typeof address === "object") port = address.port;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
});

describe("MessagingControllers (socket entry point)", () => {
  it("creates and broadcasts a message for a sender in the room", async () => {
    const senderEmail = `sender-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const recipientEmail = `recipient-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    const sender = await registerAndLogin("Sender", senderEmail);
    const recipient = await registerAndLogin("Recipient", recipientEmail);

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const senderSocket = await connectAuthedSocket(senderEmail);
    const recipientSocket = await connectAuthedSocket(recipientEmail);

    const receivedOnRecipient = new Promise<
      ServiceResult<{ message: MessageDTO }>
    >((resolve) => {
      recipientSocket.on("message:receive", resolve);
    });

    const ack = await new Promise<ServiceResult<{ message: MessageDTO }>>(
      (resolve) => {
        senderSocket.emit(
          "message:send",
          { roomId: room.data!.id, text: "hello from the socket controller" },
          resolve,
        );
      },
    );

    expect(ack.success).toBe(true);
    if (!ack.success || !ack.data) throw new Error("unreachable");
    expect(ack.data.message.text).toBe("hello from the socket controller");
    expect(ack.data.message.sender.userId).toBe(sender.id);

    const received = await receivedOnRecipient;
    expect(received.success).toBe(true);
    if (!received.success || !received.data) throw new Error("unreachable");
    expect(received.data.message.id).toBe(ack.data.message.id);

    senderSocket.disconnect();
    recipientSocket.disconnect();

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("rejects invalid payloads without hitting the service", async () => {
    const email = `invalid-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const user = await registerAndLogin("InvalidPayload", email);

    const socket = await connectAuthedSocket(email);

    const ack = await new Promise<ServiceResult<unknown>>((resolve) => {
      socket.emit("message:send", { roomId: 123, text: "" }, resolve);
    });

    expect(ack.success).toBe(false);
    expect(ack.message).toBe("Invalid input");

    socket.disconnect();
    await cleanupUser(user);
  });

  it("marks a message delivered when the recipient's socket confirms it", async () => {
    const senderEmail = `sender-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const recipientEmail = `recipient-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    const sender = await registerAndLogin("Sender", senderEmail);
    const recipient = await registerAndLogin("Recipient", recipientEmail);

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const senderSocket = await connectAuthedSocket(senderEmail);
    const recipientSocket = await connectAuthedSocket(recipientEmail);

    const sendAck = await new Promise<ServiceResult<{ message: MessageDTO }>>(
      (resolve) => {
        senderSocket.emit(
          "message:send",
          { roomId: room.data!.id, text: "please confirm receipt" },
          resolve,
        );
      },
    );
    expect(sendAck.success).toBe(true);
    if (!sendAck.success || !sendAck.data) throw new Error("unreachable");
    expect(sendAck.data.message.deliveryStatus).toBe("sent");

    const deliveredAck = await new Promise<
      ServiceResult<{ message: MessageDTO }>
    >((resolve) => {
      recipientSocket.emit(
        "message:delivered",
        { messageId: sendAck.data!.message.id },
        resolve,
      );
    });

    expect(deliveredAck.success).toBe(true);
    if (!deliveredAck.success || !deliveredAck.data) {
      throw new Error("unreachable");
    }
    expect(deliveredAck.data.message.deliveryStatus).toBe("delivered");
    expect(deliveredAck.data.message.deliveredTo).toEqual([recipient.id]);

    senderSocket.disconnect();
    recipientSocket.disconnect();

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("marks a message read when the recipient's socket confirms it", async () => {
    const senderEmail = `sender-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const recipientEmail = `recipient-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    const sender = await registerAndLogin("Sender", senderEmail);
    const recipient = await registerAndLogin("Recipient", recipientEmail);

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const senderSocket = await connectAuthedSocket(senderEmail);
    const recipientSocket = await connectAuthedSocket(recipientEmail);

    const sendAck = await new Promise<ServiceResult<{ message: MessageDTO }>>(
      (resolve) => {
        senderSocket.emit(
          "message:send",
          { roomId: room.data!.id, text: "please confirm read" },
          resolve,
        );
      },
    );
    expect(sendAck.success).toBe(true);
    if (!sendAck.success || !sendAck.data) throw new Error("unreachable");

    const readAck = await new Promise<
      ServiceResult<{ message: MessageDTO }>
    >((resolve) => {
      recipientSocket.emit(
        "message:read",
        { messageId: sendAck.data!.message.id },
        resolve,
      );
    });

    expect(readAck.success).toBe(true);
    if (!readAck.success || !readAck.data) {
      throw new Error("unreachable");
    }
    expect(readAck.data.message.deliveryStatus).toBe("read");
    expect(readAck.data.message.readBy.map((r) => r.userId)).toEqual([
      recipient.id,
    ]);

    senderSocket.disconnect();
    recipientSocket.disconnect();

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("rejects a send into a room the sender hasn't joined", async () => {
    const senderEmail = `outsider-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const a = await registerAndLogin(
      "RoomOwnerA",
      `owner-a-${Date.now()}@example.com`,
    );
    const b = await registerAndLogin(
      "RoomOwnerB",
      `owner-b-${Date.now()}@example.com`,
    );
    const outsider = await registerAndLogin("Outsider", senderEmail);

    const room = await createNewRoomService.execute({
      user: a,
      participants: [{ id: b.id }],
      name: "A, B",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const outsiderSocket = await connectAuthedSocket(senderEmail);

    const ack = await new Promise<ServiceResult<unknown>>((resolve) => {
      outsiderSocket.emit(
        "message:send",
        { roomId: room.data!.id, text: "sneaky" },
        resolve,
      );
    });

    expect(ack.success).toBe(false);
    expect(ack.message).toBe("Unauthorized room access");

    outsiderSocket.disconnect();
    await cleanupUser(a);
    await cleanupUser(b);
    await cleanupUser(outsider);
  });
});
