import { describe, expect, it, beforeEach } from "vitest";
import { ContactsControllers } from "../../controllers/ContactsControllers";
import { AddContactService } from "../../services/AddContactService";
import { SearchContactService } from "../../services/SearchContactService";
import { BlockContactService } from "../../services/BlockContactService";
import { DexieContactsRepo } from "../../adapters/DexieContactsRepo";
import { DexieRoomsRepo } from "@/domains/conversations/adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import { useAuth } from "@/stores/useAuth";
import { User } from "../../entities/user";
import type { ContactsApi } from "../../ports/ContactsApi";
import type { ContactDTO } from "../../entities/contacts";
import type { RoomDTO } from "@/domains/conversations/entities/room";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

function createFakeNotificationsPort(): NotificationsPort {
  return { notify: () => {} };
}

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
    {
      userId: CURRENT_USER.id,
      firstName: "Ada",
      lastName: "Lovelace",
      status: "accepted",
    },
    {
      userId: CONTACT_ID,
      firstName: "Grace",
      lastName: "Hopper",
      status: "pending",
    },
  ],
};

function createFakeContactsApi(
  overrides: Partial<ContactsApi> = {},
): ContactsApi {
  return {
    async search() {
      throw new Error("not used in this test");
    },
    async add() {
      return {
        success: true,
        message: "Contact added successfully",
        data: {
          addedUser: {
            userId: CONTACT_ID,
            firstName: "Grace",
            lastName: "Hopper",
            email: "grace@example.com",
          },
          room: FAKE_ROOM,
        },
      };
    },
    async block() {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

function createContactsControllers(contactsApi: ContactsApi) {
  return new ContactsControllers(
    new AddContactService(
      contactsApi,
      new DexieContactsRepo(),
      new DexieRoomsRepo(),
    ),
    new SearchContactService(contactsApi),
    new BlockContactService(
      contactsApi,
      new DexieContactsRepo(),
      new DexieRoomsRepo(),
    ),
    createFakeNotificationsPort(),
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

    const contactsControllers = createContactsControllers(
      createFakeContactsApi(),
    );

    const result = await contactsControllers.addContact({
      contactId: CONTACT_ID,
    });

    expect(result).toEqual({ success: false, message: "Not authenticated" });
  });

  it("adds the contact, persists it and the new room to Dexie", async () => {
    const contactsControllers = createContactsControllers(
      createFakeContactsApi(),
    );

    const result = await contactsControllers.addContact({
      contactId: CONTACT_ID,
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("unreachable");
    expect(result.contact.userId).toBe(CONTACT_ID);
    expect(result.room.id).toBe(FAKE_ROOM.id);

    const persistedContact: ContactDTO | undefined =
      await db.contacts.get(CONTACT_ID);
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

    const contactsControllers = createContactsControllers(
      createFakeContactsApi(),
    );

    const result = await contactsControllers.addContact({
      contactId: CONTACT_ID,
    });

    expect(result).toEqual({
      success: false,
      message: "Contact already blocked",
    });
  });

  it("rejects with the service's message when the contact is already added in Dexie", async () => {
    await db.contacts.add({
      userId: CONTACT_ID,
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
    });

    const contactsControllers = createContactsControllers(
      createFakeContactsApi(),
    );

    const result = await contactsControllers.addContact({
      contactId: CONTACT_ID,
    });

    expect(result).toEqual({
      success: false,
      message: "Contact already added",
    });
  });

  it("surfaces the api's failure message when the server rejects the add", async () => {
    const contactsApi = createFakeContactsApi({
      async add() {
        return { success: false, message: "User not found", data: null };
      },
    });
    const contactsControllers = createContactsControllers(contactsApi);

    const result = await contactsControllers.addContact({
      contactId: CONTACT_ID,
    });

    expect(result).toEqual({ success: false, message: "User not found" });
  });
});

describe("ContactsControllers.searchContact", () => {
  const FOUND_USER = User.hydrate({
    id: "user-2",
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
  });

  it("returns the found user on success", async () => {
    const contactsApi = createFakeContactsApi({
      async search() {
        return { success: true, message: "User found", data: FOUND_USER };
      },
    });
    const contactsControllers = createContactsControllers(contactsApi);

    const result = await contactsControllers.searchContact({
      email: FOUND_USER.email,
    });

    expect(result).toEqual({ success: true, user: FOUND_USER });
  });

  it("surfaces the api's failure message when the user is not found", async () => {
    const contactsApi = createFakeContactsApi({
      async search() {
        return { success: false, message: "User not found", data: null };
      },
    });
    const contactsControllers = createContactsControllers(contactsApi);

    const result = await contactsControllers.searchContact({
      email: "nobody@example.com",
    });

    expect(result).toEqual({ success: false, message: "User not found" });
  });

  it("does not require authentication (guarded by the UI layer instead, per convention)", async () => {
    useAuth.setState({ authStatus: "unauthenticated", user: null });
    const contactsApi = createFakeContactsApi({
      async search() {
        return { success: true, message: "User found", data: FOUND_USER };
      },
    });
    const contactsControllers = createContactsControllers(contactsApi);

    const result = await contactsControllers.searchContact({
      email: FOUND_USER.email,
    });

    expect(result).toEqual({ success: true, user: FOUND_USER });
  });
});

describe("ContactsControllers.blockContact", () => {
  const BLOCKED_CONTACT: ContactDTO = {
    userId: CONTACT_ID,
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
  };

  it("returns 401-equivalent failure when not authenticated", async () => {
    useAuth.setState({ authStatus: "unauthenticated", user: null });

    const contactsControllers = createContactsControllers(
      createFakeContactsApi(),
    );

    const result = await contactsControllers.blockContact({
      blockedContact: BLOCKED_CONTACT,
    });

    expect(result).toEqual({ success: false, message: "Not authenticated" });
  });

  it("blocks the contact, removing it from Dexie contacts and adding it to blocked", async () => {
    await db.contacts.add(BLOCKED_CONTACT);

    const contactsApi = createFakeContactsApi({
      async block() {
        return {
          success: true,
          message: "Contact blocked successfully",
          data: {
            blockedContactId: BLOCKED_CONTACT.userId,
            updatedRooms: [{ roomId: FAKE_ROOM.id }],
          },
        };
      },
    });
    const contactsControllers = createContactsControllers(contactsApi);

    const result = await contactsControllers.blockContact({
      blockedContact: BLOCKED_CONTACT,
    });

    expect(result).toEqual({
      success: true,
      blockedContactId: BLOCKED_CONTACT.userId,
    });
    expect(await db.contacts.get(BLOCKED_CONTACT.userId)).toBeUndefined();
    expect(await db.blockedContacts.get(BLOCKED_CONTACT.userId)).toEqual(
      BLOCKED_CONTACT,
    );
  });

  it("surfaces the api's failure message when the block fails", async () => {
    const contactsApi = createFakeContactsApi({
      async block() {
        return { success: false, message: "User not found", data: null };
      },
    });
    const contactsControllers = createContactsControllers(contactsApi);

    const result = await contactsControllers.blockContact({
      blockedContact: BLOCKED_CONTACT,
    });

    expect(result).toEqual({ success: false, message: "User not found" });
  });
});
