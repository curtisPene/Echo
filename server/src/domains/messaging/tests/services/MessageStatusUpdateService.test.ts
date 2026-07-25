import "dotenv/config";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { CreateMessageService } from "../../services/createMessageService";
import { MessageStatusUpdateService } from "../../services/MessageStatusUpdateService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { MessageRepo } from "../../repo/mongooseMessageRepo";
import { RoomRepo } from "../../../conversations/repo/mongooseRoomRepo";
import { registerAndLogin, createFakeMessagingSocket, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));
const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));

let createMessageService: CreateMessageService;
let messageStatusUpdateService: MessageStatusUpdateService;

beforeEach(() => {
  createMessageService = new CreateMessageService(
    messageRepo,
    createFakeMessagingSocket().socket,
    roomRepo,
  );
  messageStatusUpdateService = new MessageStatusUpdateService(
    messageRepo,
    roomRepo,
  );
});

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("MessageStatusUpdateService - delivered", () => {
  it("flips a 1:1 message to delivered once the other participant confirms", async () => {
    const sender = await registerAndLogin("Sender");
    const recipient = await registerAndLogin("Recipient");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello" },
    });
    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");
    expect(created.data.message.deliveryStatus).toBe("sent");

    const result = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "delivered",
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.message.deliveryStatus).toBe("delivered");
    expect(result.data.message.deliveredTo).toEqual([recipient.id]);

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("stays 'sent' in a group room until every OTHER participant confirms", async () => {
    const sender = await registerAndLogin("Sender");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: b.id }, { id: c.id }],
      name: "Group",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello group" },
    });
    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");

    const afterB = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: b.id,
      kind: "delivered",
    });
    expect(afterB.success).toBe(true);
    if (!afterB.success || !afterB.data) throw new Error("unreachable");
    expect(afterB.data.message.deliveryStatus).toBe("sent");

    const afterC = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: c.id,
      kind: "delivered",
    });
    expect(afterC.success).toBe(true);
    if (!afterC.success || !afterC.data) throw new Error("unreachable");
    expect(afterC.data.message.deliveryStatus).toBe("delivered");
    expect(afterC.data.message.deliveredTo.sort()).toEqual([b.id, c.id].sort());

    await cleanupUser(sender);
    await cleanupUser(b);
    await cleanupUser(c);
  });

  it("is read immediately for a self-chat message (no other participants to confirm anything)", async () => {
    const user = await registerAndLogin("SelfChatter");

    const room = await createNewRoomService.execute({
      user,
      participants: [{ id: user.id }],
      name: "Just Me",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: user.id, firstName: user.firstName, lastName: user.lastName },
      newMessage: { roomId: room.data.id, text: "note to self" },
    });

    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");
    // "covers every other participant" holds vacuously with zero of them,
    // for both deliveredTo and readBy - read is the highest of the two
    // states, so a self-chat message is immediately "read", not "delivered".
    expect(created.data.message.deliveryStatus).toBe("read");

    await cleanupUser(user);
  });

  it("is idempotent - confirming delivery twice from the same user doesn't duplicate deliveredTo", async () => {
    const sender = await registerAndLogin("Sender");
    const recipient = await registerAndLogin("Recipient");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello" },
    });
    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");

    await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "delivered",
    });
    const second = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "delivered",
    });

    expect(second.success).toBe(true);
    if (!second.success || !second.data) throw new Error("unreachable");
    expect(second.data.message.deliveredTo).toEqual([recipient.id]);

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("fails gracefully for a nonexistent message id", async () => {
    const user = await registerAndLogin("User");

    const result = await messageStatusUpdateService.execute({
      messageId: new mongoose.Types.ObjectId().toString(),
      userId: user.id,
      kind: "delivered",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Message not found");

    await cleanupUser(user);
  });
});

describe("MessageStatusUpdateService - read", () => {
  it("flips a 1:1 message to read once the other participant confirms, independently of deliveredTo", async () => {
    const sender = await registerAndLogin("Sender");
    const recipient = await registerAndLogin("Recipient");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello" },
    });
    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");

    const result = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "read",
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    if (result.data.message.redacted) throw new Error("unreachable");
    expect(result.data.message.deliveryStatus).toBe("read");
    expect(result.data.message.readBy.map((r) => r.userId)).toEqual([recipient.id]);
    // reading doesn't also mark it delivered - the two arrays stay independent
    expect(result.data.message.deliveredTo).toEqual([]);

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("stays below 'read' in a group room until every OTHER participant confirms", async () => {
    const sender = await registerAndLogin("Sender");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: b.id }, { id: c.id }],
      name: "Group",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello group" },
    });
    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");

    const afterB = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: b.id,
      kind: "read",
    });
    expect(afterB.success).toBe(true);
    if (!afterB.success || !afterB.data) throw new Error("unreachable");
    expect(afterB.data.message.deliveryStatus).toBe("sent");

    const afterC = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: c.id,
      kind: "read",
    });
    expect(afterC.success).toBe(true);
    if (!afterC.success || !afterC.data) throw new Error("unreachable");
    expect(afterC.data.message.deliveryStatus).toBe("read");

    await cleanupUser(sender);
    await cleanupUser(b);
    await cleanupUser(c);
  });

  it("is idempotent - confirming read twice from the same user doesn't duplicate readBy", async () => {
    const sender = await registerAndLogin("Sender");
    const recipient = await registerAndLogin("Recipient");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello" },
    });
    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");

    await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "read",
    });
    const second = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "read",
    });

    expect(second.success).toBe(true);
    if (!second.success || !second.data) throw new Error("unreachable");
    if (second.data.message.redacted) throw new Error("unreachable");
    expect(second.data.message.readBy.map((r) => r.userId)).toEqual([recipient.id]);

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("marking delivered then read on the same message keeps both arrays correct", async () => {
    const sender = await registerAndLogin("Sender");
    const recipient = await registerAndLogin("Recipient");

    const room = await createNewRoomService.execute({
      user: sender,
      participants: [{ id: recipient.id }],
      name: "Sender, Recipient",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const created = await createMessageService.execute({
      sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
      newMessage: { roomId: room.data.id, text: "hello" },
    });
    expect(created.success).toBe(true);
    if (!created.success || !created.data) throw new Error("unreachable");

    await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "delivered",
    });
    const afterRead = await messageStatusUpdateService.execute({
      messageId: created.data.message.id,
      userId: recipient.id,
      kind: "read",
    });

    expect(afterRead.success).toBe(true);
    if (!afterRead.success || !afterRead.data) throw new Error("unreachable");
    if (afterRead.data.message.redacted) throw new Error("unreachable");
    expect(afterRead.data.message.deliveredTo).toEqual([recipient.id]);
    expect(afterRead.data.message.readBy.map((r) => r.userId)).toEqual([recipient.id]);
    expect(afterRead.data.message.deliveryStatus).toBe("read");

    await cleanupUser(sender);
    await cleanupUser(recipient);
  });

  it("fails gracefully for a nonexistent message id", async () => {
    const user = await registerAndLogin("User");

    const result = await messageStatusUpdateService.execute({
      messageId: new mongoose.Types.ObjectId().toString(),
      userId: user.id,
      kind: "read",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Message not found");

    await cleanupUser(user);
  });
});
