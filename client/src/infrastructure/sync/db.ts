import type { EntityTable } from "dexie";
import Dexie from "dexie";
import type { Message } from "@/domains/messaging/types";
import type { AppContext } from "./types";
import type { Room, RoomUnreadCount } from "@/domains/presence/types";
import type { Contact } from "@/domains/conversation/types";

export const db = new Dexie("echo") as Dexie & {
  rooms: EntityTable<Room, "id">;
  messages: EntityTable<Message, "id">;
  contacts: EntityTable<Contact, "id">;
  appcontext: EntityTable<AppContext, "id">;
  roomUnreadCounts: EntityTable<RoomUnreadCount, "roomId">;
};

export type DB = typeof db;

db.version(1).stores({
  contacts: "id",
  rooms: "id, name",
  messages: "id, room, sender, createdAt",
  appcontext: "id, lastSync",
  roomUnreadCounts: "roomId",
});
