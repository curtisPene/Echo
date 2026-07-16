import { userPresenter } from "../../users/presenters/usersPresenter";
import { MessageWithPopulatedSender } from "../repo/mongooseMessageRepo";

export const messagePresenter = ({
  message,
}: {
  message: MessageWithPopulatedSender;
}) => {
  return {
    id: message._id.toString(),
    room: message.room.toString(),
    createdAt: message.createdAt.toISOString(),
    redacted: false,
    sender: message.sender._id.toString(),
    text: message.text,
    reactions: message.reactions.map((reaction) => ({
      user: userPresenter(reaction.user),
      emoji: reaction.emoji,
    })),
    readBy: message.readBy.map((read) => ({
      user: userPresenter(read.user),
      readAt: read.readAt.toISOString(),
    })),
  };
};

export type MessageView = ReturnType<typeof messagePresenter>;
