import { string } from "zod";
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
}: {
  roomId: string;
  since?: Date;
}): Promise<MessageWithPopulatedSender[]> => {
  return Message.find({
    room: roomId,
    ...(since ? { createdAt: { $gt: since } } : {}),
  })
    .populate<{
      sender: User;
      reactions: { user: User; emoji: string }[];
      readBy: { user: User; readAt: Date }[];
    }>(["sender", "reactions.user", "readBy.user"])
    .sort({ createdAt: -1 });
};

export const countUnreadMessages = async ({
  roomId,
  since,
}: {
  roomId: string;
  since?: Date;
}): Promise<number> => {
  return Message.countDocuments({
    room: roomId,
    ...(since ? { createdAt: { $gt: since } } : {}),
  });
};

export const createNewMessage = async ({
  userId,
  message,
  roomId,
}: {
  userId: string;
  message: string;
  roomId: string;
}) => {
  const _message = await Message.create({
    room: roomId,
    sender: userId,
    text: message,
  });

  const populatedMessage = await _message.populate<{
    sender: User;
    reactions: { user: User; emoji: string }[];
    readBy: { user: User; readAt: Date }[];
  }>(["sender", "reactions.user", "readBy.user"]);

  return populatedMessage;
};
