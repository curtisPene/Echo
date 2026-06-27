import { toPublicUser } from "../../users/presenters/usersPresenter";
import { MessageWithPopulatedSender } from "../repo/mongooseMessageRepo";

export const messagePresenter = ({
  messages,
}: {
  messages: MessageWithPopulatedSender[];
}) => {
  const _messages = messages.map((message) => {
    return {
      id: message._id.toString(),
      room: message.room.toString(),
      createdAt: message.createdAt.toISOString(),
      redacted: false,
      sender: message.sender._id.toString(),
      text: message.text,
      reactions: message.reactions.map((reaction) => ({
        user: toPublicUser(reaction.user),
        emoji: reaction.emoji,
      })),
      readBy: message.readBy.map((read) => ({
        user: toPublicUser(read.user),
        readAt: read.readAt.toISOString(),
      })),
    };
  });

  return _messages;
};
