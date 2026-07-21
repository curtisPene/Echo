import { describe, expect, it, beforeEach } from "vitest";
import { ContactsControllers } from "../../controllers/ContactsControllers";
import { AddContactService } from "../../services/AddContactService";
import { DexieContactsRepo } from "../../adapters/DexieContactsRepo";
import { DexieRoomsRepo } from "@/domains/conversations/adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import { useAuth } from "@/stores/useAuth";
import { User } from "../../domainModels/user";
import type { ContactsApi } from "../../ports/ContactsApi";
import type { ContactDTO } from "../../domainModels/contacts";
import type { RoomDTO } from "@/domains/conversations/domainModels/room";

const CURRENT_USER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

const CONTACT_ID = "user-2";

const FAKE_ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    { userId: CURRENT_USER.id, firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: CONTACT_ID, firstName: "Grace", lastName: "Hopper", status: "pending" },
  ],
};

function createFakeContactsApi(overrides: Partial<ContactsApi> = {}): ContactsApi {
  return {
    async search() {
      throw new Error("not used in this test");
    },
    async add() {
      return {
        success: true,
        message: "Contact added successfully",
        data: {
          addedUser: { userId: CONTACT_ID, firstName: "Grace", lastName: "Hopper", email: "grace@example.com" },
          room: FAKE_ROOM,
        },
      };
    },
    ...overrides,
  };
}

function createContactsControllers(contactsApi: ContactsApi) {
  return new ContactsControllers(
    new AddContactService(contactsApi, new DexieContactsRepo(), new DexieRoomsRepo()),
  );
}

beforeEach(async () => {
  await db.contacts.clear();
  await db.blockedContacts.clear();
  await db.rooms.clear();

  useAuth.setState({
    authStatus: "authenticated",
    user: CURRENT_USER,
    accessToken: "fake-access-token",
  });
});

describe("ContactsControllers.addContact", () => {
  it("returns 401-equivalent failure when not authenticated", async () => {
    useAuth.setState({ authStatus: "unauthenticated", user: null });

    const contactsControllers = createContactsControllers(createFakeContactsApi());

    const result = await contactsControllers.addContact({ contactId: CONTACT_ID });

    expect(result).toEqual({ success: false, message: "Not authenticated" });
  });

  it("adds the contact, persists it and the new room to Dexie", async () => {
    const contactsControllers = createContactsControllers(createFakeContactsApi());

    const result = await contactsControllers.addContact({ contactId: CONTACT_ID });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("unreachable");
    expect(result.contact.userId).toBe(CONTACT_ID);
    expect(result.room.id).toBe(FAKE_ROOM.id);

    const persistedContact: ContactDTO | undefined = await db.contacts.get(CONTACT_ID);
    expect(persistedContact?.userId).toBe(CONTACT_ID);
    expect(await db.rooms.get(FAKE_ROOM.id)).toBeDefined();
  });

  it("rejects with the service's message when the contact is already blocked in Dexie", async () => {
    await db.blockedContacts.add({
      userId: CONTACT_ID,
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
    });

    const contactsControllers = createContactsControllers(createFakeContactsApi());

    const result = await contactsControllers.addContact({ contactId: CONTACT_ID });

    expect(result).toEqual({ success: false, message: "Contact already blocked" });
  });

  it("rejects with the service's message when the contact is already added in Dexie", async () => {
    await db.contacts.add({
      userId: CONTACT_ID,
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
    });

    const contactsControllers = createContactsControllers(createFakeContactsApi());

    const result = await contactsControllers.addContact({ contactId: CONTACT_ID });

    expect(result).toEqual({ success: false, message: "Contact already added" });
  });

  it("surfaces the api's failure message when the server rejects the add", async () => {
    const contactsApi = createFakeContactsApi({
      async add() {
        return { success: false, message: "User not found", data: null };
      },
    });
    const contactsControllers = createContactsControllers(contactsApi);

    const result = await contactsControllers.addContact({ contactId: CONTACT_ID });

    expect(result).toEqual({ success: false, message: "User not found" });
  });
});
