import type { ServiceResult } from "@/types";
import type { Room } from "@/domains/conversations/entities/room";
import type { Message } from "@/domains/messaging/entities/message";
import type { Contacts } from "@/domains/authAndAccess/entities/contacts";

export type SyncData = {
  rooms: { room: Room; unread: number }[];
  messages: Message[];
  contacts: Contacts;
  lastSync: string;
};

export interface SyncApi {
  fetchSyncData(params: { since?: string }): Promise<ServiceResult<SyncData>>;
}
