import { User } from "../../users/models/userModel";
import { Message, MessageReaction, MessageRead } from "../models/messageModel";

export type MessageWithPopulatedSender = Omit<
  Message,
  "sender" | "reactions" | "readBy"
> & {
  sender: User;
  reactions: (Omit<MessageReaction, "user"> & { user: User })[];
  readBy: (Omit<MessageRead, "user"> & { user: User })[];
};

export const findRoomMessages = async ({
  roomId,
  since,
  countUnreadSince,
}: {
  roomId: string;
  since?: Date;
  countUnreadSince?: Date;
}): Promise<{
  messages: MessageWithPopulatedSender[];
  unreadCount: number;
}> => {
  const [messages, unreadCount] = await Promise.all([
    Message.find({
      room: roomId,
      ...(since ? { createdAt: { $gt: since } } : {}),
    })
      .populate<{
        sender: User;
        reactions: { user: User; emoji: string }[];
        readBy: { user: User; readAt: Date }[];
      }>(["sender", "reactions.user", "readBy.user"])
      .sort({ createdAt: -1 }),
    Message.countDocuments({
      room: roomId,
      ...(countUnreadSince ? { createdAt: { $gt: countUnreadSince } } : {}),
    }),
  ]);

  return { messages, unreadCount };
};
