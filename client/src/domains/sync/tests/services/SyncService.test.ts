import { describe, expect, it, beforeEach } from "vitest";
import { SyncService } from "../../services/SyncService";
import { DexieSyncRepo } from "../../adapters/DexieSyncRepo";
import { DexieRoomsRepo } from "@/domains/conversations/adapters/DexieRoomsRepo";
import { DexieContactsRepo } from "@/domains/authAndAccess/adapters/DexieContactsRepo";
import { DexieMessagesRepo } from "@/domains/messaging/adapters/DexieMessagesRepo";
import { db } from "@/infrastructure/sync/db";
import { Room } from "@/domains/conversations/entities/room";
import { Message } from "@/domains/messaging/entities/message";
import { Contacts } from "@/domains/authAndAccess/entities/contacts";
import { User } from "@/domains/authAndAccess/entities/user";
import type { Auth } from "@/stores/useAuth";
import type { SyncApi, SyncData } from "../../ports/SyncApi";
import type { ServiceResult } from "@/types";

const CURRENT_USER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

const AUTH: Extract<Auth, { authStatus: "authenticated" }> = {
  authStatus: "authenticated",
  user: CURRENT_USER,
  accessToken: "fake-access-token",
};

const ROOM = Room.hydrate({
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    {
      userId: CURRENT_USER.id,
      firstName: "Ada",
      lastName: "Lovelace",
      email: CURRENT_USER.email,
      status: "accepted",
    },
    {
      userId: "user-2",
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      status: "accepted",
    },
  ],
});

const MESSAGE = Message.hydrate({
  id: "message-1",
  roomId: "room-1",
  redacted: false,
  sender: { userId: "user-2", firstName: "Grace", lastName: "Hopper" },
  text: "hi",
  createdAt: "2026-01-01T00:00:00.000Z",
  reactions: [],
  readBy: [],
  deliveredTo: [],
  deliveryStatus: "sent",
});

const CONTACTS = Contacts.hydrate({
  id: "contacts-1",
  userId: CURRENT_USER.id,
  contacts: [
    { userId: "user-2", firstName: "Grace", lastName: "Hopper", email: "grace@example.com" },
  ],
  blocked: [],
});

function createFakeSyncApi(overrides: Partial<SyncApi> = {}): SyncApi {
  return {
    async fetchSyncData(): Promise<ServiceResult<SyncData>> {
      return {
        success: true,
        message: "Sync data fetched successfully",
        data: {
          rooms: [{ room: ROOM, unread: 0 }],
          messages: [MESSAGE],
          contacts: CONTACTS,
          lastSync: "2026-01-01T00:00:00.000Z",
        },
      };
    },
    ...overrides,
  };
}

function createService(syncApi: SyncApi = createFakeSyncApi()) {
  return new SyncService(
    syncApi,
    new DexieSyncRepo(),
    new DexieRoomsRepo(),
    new DexieContactsRepo(),
    new DexieMessagesRepo(),
  );
}

beforeEach(async () => {
  await db.rooms.clear();
  await db.messages.clear();
  await db.contacts.clear();
  await db.syncContext.clear();
});

describe("SyncService", () => {
  it("populates Dexie with rooms, messages, and contacts on a fresh sync", async () => {
    const service = createService();

    const result = await service.execute({ auth: AUTH });

    expect(result.success).toBe(true);
    expect(await db.rooms.get("room-1")).toBeDefined();
    expect(await db.messages.get("message-1")).toBeDefined();
    expect(await db.contacts.get("user-2")).toBeDefined();
  });

  it("still performs a full sync and populates data when a sync context already exists for the same user", async () => {
    // A stale local sync context (e.g. from a prior session) must never
    // cause the client to treat this as an incremental sync - since is
    // never sent, so the server always returns everything, and Dexie
    // must end up populated regardless of what context existed beforehand.
    await db.syncContext.put({
      id: "current",
      userId: CURRENT_USER.id,
      lastSyncedAt: "2020-01-01T00:00:00.000Z",
    });

    const service = createService();

    const result = await service.execute({ auth: AUTH });

    expect(result.success).toBe(true);
    expect(await db.rooms.get("room-1")).toBeDefined();
    expect(await db.messages.get("message-1")).toBeDefined();
  });

  it("does NOT wipe the local database when the same user syncs again", async () => {
    // A same-user re-sync (every login, every app boot) must never drop
    // local data first - only switching users should. Seed an unrelated
    // room that the fake sync api's response doesn't mention at all; if
    // the service dropped the database it would be gone.
    await db.syncContext.put({
      id: "current",
      userId: CURRENT_USER.id,
      lastSyncedAt: "2020-01-01T00:00:00.000Z",
    });
    await db.rooms.put({
      id: "room-preexisting",
      name: "Pre-existing room",
      participants: [],
    });

    const service = createService();

    const result = await service.execute({ auth: AUTH });

    expect(result.success).toBe(true);
    expect(await db.rooms.get("room-preexisting")).toBeDefined();
  });

  it("wipes the local database when a different user logs in", async () => {
    await db.syncContext.put({
      id: "current",
      userId: "some-other-user",
      lastSyncedAt: "2020-01-01T00:00:00.000Z",
    });
    await db.rooms.put({
      id: "room-belongs-to-other-user",
      name: "Should be wiped",
      participants: [],
    });

    const service = createService();

    const result = await service.execute({ auth: AUTH });

    expect(result.success).toBe(true);
    expect(await db.rooms.get("room-belongs-to-other-user")).toBeUndefined();
    expect(await db.rooms.get("room-1")).toBeDefined();
  });

  it("never sends a 'since' value to the sync api", async () => {
    let receivedSince: string | undefined = "not-called";
    const syncApi = createFakeSyncApi({
      async fetchSyncData(params) {
        receivedSince = params.since;
        return {
          success: true,
          message: "Sync data fetched successfully",
          data: {
            rooms: [{ room: ROOM, unread: 0 }],
            messages: [MESSAGE],
            contacts: CONTACTS,
            lastSync: "2026-01-01T00:00:00.000Z",
          },
        };
      },
    });
    const service = createService(syncApi);

    await service.execute({ auth: AUTH });

    expect(receivedSince).toBeUndefined();
  });

  it("surfaces failure when the sync api call fails", async () => {
    const syncApi = createFakeSyncApi({
      async fetchSyncData() {
        return { success: false, message: "Sync failed", data: null };
      },
    });
    const service = createService(syncApi);

    const result = await service.execute({ auth: AUTH });

    expect(result).toEqual({
      success: false,
      message: "Sync failed",
      data: null,
    });
    expect(await db.rooms.count()).toBe(0);
  });
});
