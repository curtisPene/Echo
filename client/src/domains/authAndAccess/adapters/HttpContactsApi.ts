import {
  addContactResponseSchema,
  blockContactResponseSchema,
  contactsSearchResponseSchema,
} from "../types";
import { httpClient } from "@/lib/httpClient";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { User } from "../entities/user";
import { Room } from "@/domains/conversations/entities/room";
import type { ServiceResult } from "@/types";
import type { ContactDTO } from "../entities/contacts";
import type { ContactsApi, BlockedRoomUpdate } from "../ports/ContactsApi";

export class HttpContactsApi implements ContactsApi {
  async search(email: string): Promise<ServiceResult<User>> {
    const response = await httpClient.post("/contacts/search", { email });
    const parsed = parseOrThrow(contactsSearchResponseSchema, response.data);

    if (!parsed.success || !parsed.data) {
      return { success: false, message: parsed.message, data: null };
    }

    return {
      success: true,
      message: parsed.message,
      data: User.hydrate(parsed.data),
    };
  }

  async add({
    contactId,
  }: {
    contactId: string;
  }): Promise<ServiceResult<{ addedUser: ContactDTO; room: Room }>> {
    const response = await httpClient.post("/contacts/add", {
      userId: contactId,
    });
    const parsed = parseOrThrow(addContactResponseSchema, response.data);

    if (!parsed.success || !parsed.data) {
      return { success: false, message: parsed.message, data: null };
    }

    return {
      success: true,
      message: parsed.message,
      data: {
        addedUser: parsed.data.addedUser,
        room: Room.hydrate(parsed.data.room),
      },
    };
  }

  async block({
    blockedContactId,
  }: {
    blockedContactId: string;
  }): Promise<
    ServiceResult<{ blockedContactId: string; updatedRooms: BlockedRoomUpdate[] }>
  > {
    const response = await httpClient.post("/contacts/block", {
      userId: blockedContactId,
    });
    const parsed = parseOrThrow(blockContactResponseSchema, response.data);

    if (!parsed.success || !parsed.data) {
      return { success: false, message: parsed.message, data: null };
    }

    return {
      success: true,
      message: parsed.message,
      data: {
        blockedContactId: parsed.data.blockedContactId,
        updatedRooms: parsed.data.updatedRooms.map((updated) =>
          "room" in updated
            ? { roomId: updated.roomId, room: Room.hydrate(updated.room) }
            : { roomId: updated.roomId },
        ),
      },
    };
  }
}
