import { httpClient } from "@/lib/httpClient";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { appSyncResponseSchema } from "../types";
import { Room } from "@/domains/conversations/entities/room";
import { Message } from "@/domains/messaging/entities/message";
import { Contacts } from "@/domains/authAndAccess/entities/contacts";
import type { ServiceResult } from "@/types";
import type { SyncApi, SyncData } from "../ports/SyncApi";

export class HttpSyncApi implements SyncApi {
  async fetchSyncData({
    since,
  }: {
    since?: string;
  }): Promise<ServiceResult<SyncData>> {
    const response = await httpClient.get(
      `/sync/user?${since ? `since=${since}` : ""}`,
    );
    const parsed = parseOrThrow(appSyncResponseSchema, response.data);

    if (!parsed.success || !parsed.data) {
      return { success: false, message: parsed.message, data: null };
    }

    return {
      success: true,
      message: parsed.message,
      data: {
        rooms: parsed.data.rooms.map((r) => ({
          room: Room.hydrate(r.room),
          unread: r.unread,
        })),
        messages: parsed.data.messages.map((m) => Message.hydrate(m)),
        contacts: Contacts.hydrate(parsed.data.contacts),
        lastSync: parsed.data.lastSync,
      },
    };
  }
}
