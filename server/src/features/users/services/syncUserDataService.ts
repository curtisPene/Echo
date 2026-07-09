import {
  contactsPresenter,
  ContactView,
} from "../../contacts/presenters/contactsPresenter";
import { findContactsByUserId } from "../../contacts/repo/mongooseContactsRepo";
import {
  messagePresenter,
  MessageView,
} from "../../rooms/presenters/messagePresenter";
import { roomPresenter, RoomView } from "../../rooms/presenters/roomsPresenter";
import {
  countUnreadMessages,
  findRoomMessages,
} from "../../rooms/repo/mongooseMessageRepo";
import { findRoomsWithUserId } from "../../rooms/repo/mongooseRoomRepo";
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
    rooms: { room: RoomView; unread: number }[];
    messages: MessageView[];
    contacts: ContactView[];
    lastSync: string;
  }>
> {
  try {
    const sinceDate = since ? new Date(since) : undefined;

    /**
     * We first need to find all the rooms the user is part of, we use the roomIds
     * to search for all messages belonging to those rooms since the last sync
     */

    const roomDocs = await findRoomsWithUserId({ userId });
    const findMessagesRepoResult = await Promise.all(
      roomDocs.map(async (room) => {
        const messageDocs = await findRoomMessages({
          roomId: room._id.toString(),
          since: sinceDate,
        });

        const messageViews = messageDocs.map((message) =>
          messagePresenter({ message }),
        );

        const unread = await countUnreadMessages({
          roomId: room._id.toString(),
          userId,
        });

        return {
          room: roomPresenter({
            room,
          }),
          messages: messageViews,
          unread,
        };
      }),
    );

    const contactDocs = await findContactsByUserId({
      userId,
      since: sinceDate,
    });
    const contactsViews = contactsPresenter({ contacts: contactDocs });

    const rooms = findMessagesRepoResult.map((room) => {
      return {
        room: room.room,
        unread: room.unread,
      };
    });
    const messages = findMessagesRepoResult.flatMap((room) => room.messages);

    return {
      success: true,
      message: "Sync data fetched successfully",
      data: {
        rooms,
        messages,
        contacts: contactsViews,
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
