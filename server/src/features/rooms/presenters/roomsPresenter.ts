import { userPresenter } from "../../users/presenters/usersPresenter";
import { MessageWithPopulatedSender } from "../repo/mongooseMessageRepo";
import { RoomWithPopulatedParticipants } from "../repo/mongooseRoomRepo";
import { messagePresenter } from "./messagePresenter";

export const roomPresenter = ({
  room,
  unread,
  lastMessage,
}: {
  room: RoomWithPopulatedParticipants;
  unread: number;
  lastMessage: MessageWithPopulatedSender | null;
}) => {
  return {
    id: room._id.toString(),
    participants: room.participants.map((participant) => ({
      user: userPresenter(participant.user),
      lastReadAt: participant.lastReadAt?.toISOString() ?? null,
    })),
    name: room.name,
    lastMessageAt: room.lastMessageAt?.toISOString() ?? null,
    lastMessage: lastMessage
      ? messagePresenter({ message: lastMessage }).text
      : null,
    unread,
  };
};

export type RoomView = ReturnType<typeof roomPresenter>;
