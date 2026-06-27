import { contactsPresenter } from "../../contacts/presenters/contactsPresenter";
import { findContactsByUserId } from "../../contacts/repo/mongooseContactsRepo";
import { messagePresenter } from "../../rooms/presenters/messagePresenter";
import { roomsPresenter } from "../../rooms/presenters/roomsPresenter";
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

  const roomsDocs = await findRoomsWithUserId({ userId, since: sinceDate });
  const presentedRoomsAndMessages = await Promise.all(
    roomsDocs.map(async (room) => {
      const roomId = room._id.toString();
      const lastReadAt = room.participants.find(
        (p) => p.user._id.toString() === userId,
      )?.lastReadAt;

      const { messages: messageDocs, unreadCount } = await findRoomMessages({
        roomId,
        since: sinceDate,
        countUnreadSince: lastReadAt,
      });

      const [_room] = roomsPresenter({
        rooms: [room],
        unread: unreadCount,
        lastMessage: messageDocs[0],
      });

      return {
        room: _room,
        messages: messagePresenter({ messages: messageDocs }),
      };
    }),
  );

  const contactsDoc = await findContactsByUserId({ userId: userId, since });
  const contacts = contactsPresenter({ contacts: contactsDoc });

  const rooms = presentedRoomsAndMessages.map(({ room }) => room);
  const messages = presentedRoomsAndMessages.flatMap(
    ({ messages }) => messages,
  );

  return { rooms, messages, contacts };
}
