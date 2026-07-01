import { contactsPresenter } from "../../contacts/presenters/contactsPresenter";
import { findContactsByUserId } from "../../contacts/repo/mongooseContactsRepo";
import { messagePresenter } from "../../rooms/presenters/messagePresenter";
import { roomPresenter } from "../../rooms/presenters/roomsPresenter";
import { findRoomMessages } from "../../rooms/repo/mongooseMessageRepo";
import { findRoomsWithUserId } from "../../rooms/repo/mongooseRoomRepo";

export async function syncUserDataService({
  userId,
  since,
}: {
  userId: string;
  since?: string;
}) {
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

      const messageViews = messageDocs.messages.map((message) =>
        messagePresenter({ message }),
      );

      return {
        room: roomPresenter({
          room,
          unread: messageDocs.unreadCount,
          lastMessage: messageDocs.messages[0],
        }),
        messages: messageViews,
      };
    }),
  );

  const contactDocs = await findContactsByUserId({ userId, since: sinceDate });
  const contactsViews = contactsPresenter({ contacts: contactDocs });

  const rooms = findMessagesRepoResult.map((room) => room.room);
  const messages = findMessagesRepoResult.flatMap((room) => room.messages);

  return {
    rooms,
    messages,
    contacts: contactsViews,
    lastSync: new Date().toISOString(),
  };
}
