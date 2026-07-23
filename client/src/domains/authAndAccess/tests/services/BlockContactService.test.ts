import { describe, expect, it, beforeEach } from "vitest";
import { BlockContactService } from "../../services/BlockContactService";
import { DexieContactsRepo } from "../../adapters/DexieContactsRepo";
import { DexieRoomsRepo } from "@/domains/conversations/adapters/DexieRoomsRepo";
import { db } from "@/infrastructure/sync/db";
import type { ContactsApi } from "../../ports/ContactsApi";
import type { ContactDTO } from "../../entities/contacts";
import type { RoomDTO } from "@/domains/conversations/entities/room";

const BLOCKED_CONTACT: ContactDTO = {
  userId: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
};

const GROUP_ROOM: RoomDTO = {
  id: "room-group",
  name: "Ada, Grace, Alan",
  participants: [
    { userId: "user-1", firstName: "Ada", lastName: "Lovelace", status: "accepted" },
    { userId: "user-3", firstName: "Alan", lastName: "Turing", status: "accepted" },
  ],
};

function createFakeContactsApi(overrides: Partial<ContactsApi> = {}): ContactsApi {
  return {
    async search() {
      throw new Error("not used in this test");
    },
    async add() {
      throw new Error("not used in this test");
    },
    async block() {
      return {
        success: true,
        message: "Contact blocked successfully",
        data: {
          blockedContactId: BLOCKED_CONTACT.userId,
          updatedRooms: [{ roomId: "room-1on1" }],
        },
      };
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.contacts.clear();
  await db.blockedContacts.clear();
  await db.rooms.clear();

  await db.contacts.add(BLOCKED_CONTACT);
});

describe("BlockContactService", () => {
  it("deletes a 1:1 room, moves the contact to blocked, on success", async () => {
    await db.rooms.add({
      id: "room-1on1",
      name: "Ada, Grace",
      participants: [],
    });

    const service = new BlockContactService(
      createFakeContactsApi(),
      new DexieContactsRepo(),
      new DexieRoomsRepo(),
    );

    const result = await service.execute({ blockedContact: BLOCKED_CONTACT });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.blockedContactId).toBe(BLOCKED_CONTACT.userId);

    expect(await db.contacts.get(BLOCKED_CONTACT.userId)).toBeUndefined();
    expect(await db.blockedContacts.get(BLOCKED_CONTACT.userId)).toEqual(
      BLOCKED_CONTACT,
    );
    expect(await db.rooms.get("room-1on1")).toBeUndefined();
  });

  it("updates (not deletes) a group room the blocker remains in", async () => {
    const contactsApi = createFakeContactsApi({
      async block() {
        return {
          success: true,
          message: "Contact blocked successfully",
          data: {
            blockedContactId: BLOCKED_CONTACT.userId,
            updatedRooms: [{ roomId: GROUP_ROOM.id, room: GROUP_ROOM }],
          },
        };
      },
    });
    const service = new BlockContactService(
      contactsApi,
      new DexieContactsRepo(),
      new DexieRoomsRepo(),
    );

    const result = await service.execute({ blockedContact: BLOCKED_CONTACT });

    expect(result.success).toBe(true);
    expect(await db.rooms.get(GROUP_ROOM.id)).toEqual(GROUP_ROOM);
  });

  it("surfaces the api's failure message and does not touch Dexie", async () => {
    const contactsApi = createFakeContactsApi({
      async block() {
        return { success: false, message: "User not found", data: null };
      },
    });
    const service = new BlockContactService(
      contactsApi,
      new DexieContactsRepo(),
      new DexieRoomsRepo(),
    );

    const result = await service.execute({ blockedContact: BLOCKED_CONTACT });

    expect(result).toEqual({
      success: false,
      message: "User not found",
      data: null,
    });
    expect(await db.contacts.get(BLOCKED_CONTACT.userId)).toEqual(
      BLOCKED_CONTACT,
    );
    expect(await db.blockedContacts.get(BLOCKED_CONTACT.userId)).toBeUndefined();
  });

  it("returns a generic failure when the api throws", async () => {
    const contactsApi = createFakeContactsApi({
      async block() {
        throw new Error("network down");
      },
    });
    const service = new BlockContactService(
      contactsApi,
      new DexieContactsRepo(),
      new DexieRoomsRepo(),
    );

    const result = await service.execute({ blockedContact: BLOCKED_CONTACT });

    expect(result).toEqual({
      success: false,
      message: "An unexpected error occurred",
      data: null,
    });
  });
});
