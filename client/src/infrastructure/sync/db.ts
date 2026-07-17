import type { EntityTable } from "dexie";
import Dexie from "dexie";
import type { MessageDTO } from "@/domains/messaging/types";
import type { AppContext } from "./types";
import type { RoomDTO, RoomUnreadCount } from "@/domains/conversations/types";
import type { ContactDTO } from "@/domains/authAndAccess/domainModels/contacts";

export const db = new Dexie("echo") as Dexie & {
  rooms: EntityTable<RoomDTO, "id">;
  messages: EntityTable<MessageDTO, "id">;
  contacts: EntityTable<ContactDTO, "userId">;
  blockedContacts: EntityTable<ContactDTO, "userId">;
  appcontext: EntityTable<AppContext, "id">;
  roomUnreadCounts: EntityTable<RoomUnreadCount, "roomId">;
};

export type DB = typeof db;

db.version(1).stores({
  contacts: "userId",
  blockedContacts: "userId",
  rooms: "id, name",
  messages: "id, roomId, [sender.userId], createdAt",
  appcontext: "id, lastSync",
  roomUnreadCounts: "roomId",
});
