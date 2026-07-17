import { contactsRepo } from "../repo/ContactsRepo";
import { findRoomsForUserService } from "../../conversations/composition";
import { findRoomMessagesService } from "../../messaging/composition";
import { RoomDTO } from "../../conversations/domainModels/room";
import { MessageDTO } from "../../messaging/domainModels/message";
import { ContactsDTO } from "../domainModels/contacts";
import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";

export async function syncUserDataService({
  userId,
  since,
}: {
  userId: string;
  since?: string;
}): Promise<
  ServiceResult<{
    rooms: { room: RoomDTO; unread: number }[];
    messages: MessageDTO[];
    contacts: ContactsDTO;
    lastSync: string;
  }>
> {
  try {
    const sinceDate = since ? new Date(since) : undefined;

    /**
     * We first need to find all the rooms the user is part of, we use the roomIds
     * to search for all messages belonging to those rooms since the last sync
     */

    const rooms = await findRoomsForUserService.execute({ userId, since: sinceDate });
    const findMessagesResult = await Promise.all(
      rooms.map(async (room) => {
        const { messages, unread } = await findRoomMessagesService.execute({
          roomId: room.id,
          userId,
          since: sinceDate,
        });

        return { room, messages, unread };
      }),
    );

    const contacts = await contactsRepo.findByUserId({ userId });
    const contactsView = contacts.toDTO();

    const roomsWithUnread = findMessagesResult.map((result) => ({
      room: result.room,
      unread: result.unread,
    }));
    const messages = findMessagesResult.flatMap((result) => result.messages);

    return {
      success: true,
      message: "Sync data fetched successfully",
      data: {
        rooms: roomsWithUnread,
        messages,
        contacts: contactsView,
        lastSync: new Date().toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof RepoError) {
      console.error("[Repo]", error.message);
    } else {
      console.error(error);
    }
    return { success: false, message: "Internal server error", data: null };
  }
}
