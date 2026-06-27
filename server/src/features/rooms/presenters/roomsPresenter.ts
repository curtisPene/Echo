import { toPublicUser } from "../../users/presenters/usersPresenter";
import { MessageWithPopulatedSender } from "../repo/mongooseMessageRepo";
import { RoomWithPopulatedParticipants } from "../repo/mongooseRoomRepo";
import { messagePresenter } from "./messagePresenter";

export const roomsPresenter = ({
  rooms,
  unread,
  lastMessage,
}: {
  rooms: RoomWithPopulatedParticipants[];
  unread: number;
  lastMessage: MessageWithPopulatedSender;
}) => {
  const _rooms = rooms.map((room) => {
    return {
      id: room._id.toString(),
      participants: room.participants.map((participant) => ({
        user: toPublicUser(participant.user),
        lastReadAt: participant.lastReadAt?.toISOString() ?? null,
      })),
      name: room.name ?? null,
      lastMessageAt: room.lastMessageAt?.toISOString() ?? null,
      lastMessage: messagePresenter({ messages: [lastMessage] })[0].text,
      unread,
    };
  });

  return _rooms;
};
