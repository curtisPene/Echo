import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService, syncUserDataService } from "../../../../composition";
import { AddContactService } from "../../../authAndAccess/services/AddContactService";
import { CreateMessageService } from "../../../messaging/services/createMessageService";
import { MessageRepo } from "../../../messaging/repo/mongooseMessageRepo";
import { RoomRepo } from "../../../conversations/repo/mongooseRoomRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { contactsRepo } from "../../../authAndAccess/repo/ContactsRepo";
import {
  registerAndLogin,
  cleanupUser,
  createFakeSocket,
  createFakeMessagingSocket,
} from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const findUserIdentitiesService = new FindUserIdentitiesService(userRepo);
const roomRepo = new RoomRepo(findUserIdentitiesService);
const messageRepo = new MessageRepo(findUserIdentitiesService);
const { socket: fakeMessagingSocket } = createFakeMessagingSocket();
const createMessageService = new CreateMessageService(
  messageRepo,
  fakeMessagingSocket,
  roomRepo,
);
const addContactService = new AddContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  createNewRoomService,
);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("SyncUserDataService", () => {
  it("returns the user's rooms, messages, and contacts in one payload", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const addContactResult = await addContactService.execute({
      userId: a.id,
      contactId: b.id,
    });
    expect(addContactResult.success).toBe(true);
    if (!addContactResult.success || !addContactResult.data)
      throw new Error("unreachable");

    const roomId = addContactResult.data.room.id;

    const messageResult = await createMessageService.execute({
      sender: a,
      newMessage: { roomId, text: "hello" },
    });
    expect(messageResult.success).toBe(true);

    const result = await syncUserDataService.execute({ userId: a.id });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    const roomIds = result.data.rooms.map((r) => r.room.id);
    expect(roomIds).toContain(roomId);

    const messageTexts = result.data.messages.map((m) => m.text);
    expect(messageTexts).toContain("hello");

    const contactUserIds = result.data.contacts.contacts.map((c) => c.userId);
    expect(contactUserIds).toContain(b.id);

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("returns empty rooms/messages for a user with no rooms", async () => {
    const a = await registerAndLogin("A");

    const result = await syncUserDataService.execute({ userId: a.id });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.rooms).toEqual([]);
    expect(result.data.messages).toEqual([]);

    await cleanupUser(a);
  });
});
