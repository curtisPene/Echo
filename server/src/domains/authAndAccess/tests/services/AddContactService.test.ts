import "dotenv/config";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createNewRoomService } from "../../../../composition";
import { AddContactService } from "../../services/AddContactService";
import { BlockContactService } from "../../services/BlockContactService";
import { userRepo } from "../../repo/UserRepo";
import { contactsRepo } from "../../repo/ContactsRepo";
import { FindUserIdentitiesService } from "../../services/FindUserIdentitiesService";
import { RoomRepo } from "../../../conversations/repo/mongooseRoomRepo";
import { MessageRepo } from "../../../messaging/repo/mongooseMessageRepo";
import { FindRoomsForUserService } from "../../../conversations/services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "../../../conversations/services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../../../conversations/services/DeleteRoomService";
import { DeleteRoomMessagesService } from "../../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../../messaging/services/RedactUserMessagesInRoomService";
import {
  registerAndLogin,
  createFakeSocket,
  cleanupUser,
} from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

let fakeSocket: ReturnType<typeof createFakeSocket>;
let addContactService: AddContactService;

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));

const blockContactService = new BlockContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  new FindRoomsForUserService(roomRepo),
  new RemoveParticipantFromRoomService(roomRepo),
  new DeleteRoomService(roomRepo),
  new DeleteRoomMessagesService(messageRepo),
  new RedactUserMessagesInRoomService(messageRepo),
);

beforeEach(() => {
  fakeSocket = createFakeSocket();
  addContactService = new AddContactService(
    userRepo,
    contactsRepo,
    fakeSocket.socket,
    createNewRoomService,
  );
});

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

const cleanup = cleanupUser;

describe("AddContactService", () => {
  it("adds the contact to the adder's contacts list", async () => {
    const adder = await registerAndLogin("A");
    const contact = await registerAndLogin("B");

    const result = await addContactService.execute({
      userId: adder.id,
      contactId: contact.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.addedUser.userId).toBe(contact.id);

    const adderContacts = await contactsRepo.findByUserId({ userId: adder.id });
    expect(adderContacts.hasContact(contact.id)).toBe(true);

    // One-directional by design: the added contact does not get the
    // adder back in their own contacts list from this call alone.
    const contactsOfContact = await contactsRepo.findByUserId({
      userId: contact.id,
    });
    expect(contactsOfContact.hasContact(adder.id)).toBe(false);

    await cleanup(adder);
    await cleanup(contact);
  });

  it("creates a 1:1 room with the adder accepted and the contact pending", async () => {
    const adder = await registerAndLogin("A");
    const contact = await registerAndLogin("B");

    const result = await addContactService.execute({
      userId: adder.id,
      contactId: contact.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    const room = result.data.room;
    expect(room.participants).toHaveLength(2);

    const adderParticipant = room.participants.find(
      (p) => p.userId === adder.id,
    );
    const contactParticipant = room.participants.find(
      (p) => p.userId === contact.id,
    );

    expect(adderParticipant?.status).toBe("accepted");
    expect(contactParticipant?.status).toBe("pending");

    await cleanup(adder);
    await cleanup(contact);
  });

  it("joins both the adder's and the added contact's sockets to the new room, and notifies the added contact", async () => {
    const adder = await registerAndLogin("A");
    const contact = await registerAndLogin("B");

    const result = await addContactService.execute({
      userId: adder.id,
      contactId: contact.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    const roomId = result.data.room.id;

    expect(fakeSocket.calls).toContainEqual({
      method: "joinRoom",
      args: { userId: adder.id, roomId },
    });
    expect(fakeSocket.calls).toContainEqual({
      method: "joinRoom",
      args: { userId: contact.id, roomId },
    });

    const notifyCall = fakeSocket.calls.find(
      (call) => call.method === "emitToUser",
    );
    expect(notifyCall).toBeDefined();
    expect((notifyCall?.args as { userId: string }).userId).toBe(contact.id);
    expect((notifyCall?.args as { event: string }).event).toBe("room:updated");

    await cleanup(adder);
    await cleanup(contact);
  });

  it("rejects adding a contact that's already added", async () => {
    const adder = await registerAndLogin("A");
    const contact = await registerAndLogin("B");

    const first = await addContactService.execute({
      userId: adder.id,
      contactId: contact.id,
    });
    expect(first.success).toBe(true);

    const second = await addContactService.execute({
      userId: adder.id,
      contactId: contact.id,
    });

    expect(second.success).toBe(false);
    expect(second.message).toBe("Contact already added");

    await cleanup(adder);
    await cleanup(contact);
  });

  it("rejects adding a user that has blocked the adder", async () => {
    const adder = await registerAndLogin("A");
    const blocker = await registerAndLogin("B");

    // B blocks A first, using the real block flow.
    const blockResult = await blockContactService.execute({
      user: blocker.id,
      blockedUser: adder.id,
    });
    expect(blockResult.success).toBe(true);

    const result = await addContactService.execute({
      userId: adder.id,
      contactId: blocker.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Contact blocked the client");

    await cleanup(adder);
    await cleanup(blocker);
  });
});
