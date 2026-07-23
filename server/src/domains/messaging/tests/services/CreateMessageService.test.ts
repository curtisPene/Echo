import "dotenv/config";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { CreateMessageService } from "../../services/createMessageService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { MessageRepo } from "../../repo/mongooseMessageRepo";
import { RoomRepo } from "../../../conversations/repo/mongooseRoomRepo";
import { registerAndLogin, createFakeMessagingSocket, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));
const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));

let fakeSocket: ReturnType<typeof createFakeMessagingSocket>;
let createMessageService: CreateMessageService;

beforeEach(() => {
  fakeSocket = createFakeMessagingSocket();
  createMessageService = new CreateMessageService(messageRepo, fakeSocket.socket, roomRepo);
});

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("CreateMessageService", () => {
  it("creates a message with the sender's identity attached", async () => {
    const sender = await registerAndLogin("Sender");
    const recipient = await registerAndLogin("Recipient");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello" },
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.message.text).toBe("hello");
    expect(result.data.message.sender.userId).toBe(sender.id);
    expect(result.data.message.roomId).toBe(room.data.id);
    expect(result.data.message.redacted).toBe(false);

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("broadcasts message:receive to the room on success", async () => {
    const sender = await registerAndLogin("Sender");
    const recipient = await registerAndLogin("Recipient");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello" },
    });

    const emitCall = fakeSocket.calls.find((call) => call.method === "emitToRoom");
    expect(emitCall).toBeDefined();
    expect((emitCall?.args as { roomId: string }).roomId).toBe(room.data.id);
    expect((emitCall?.args as { event: string }).event).toBe("message:receive");

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("fails gracefully for an invalid room id", async () => {
    const sender = await registerAndLogin("Sender");

    const result = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: "not-a-valid-object-id", text: "hello" },
    });

    expect(result.success).toBe(false);

    await cleanupUser(sender);
  });
});
