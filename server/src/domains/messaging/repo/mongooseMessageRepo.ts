import { Message as MessageDoc } from "../models/messageModel";
import { Message, NewMessage } from "../domainModels/message";
import { findUserIdentitiesService } from "../../authAndAccess/composition";

async function toMessageParams(doc: {
  _id: { toString(): string };
  room: { toString(): string };
  sender: { toString(): string };
  text: string;
  redacted: boolean;
  createdAt: Date;
  reactions: { user: { toString(): string }; emoji: string }[];
  readBy: { user: { toString(): string }; readAt: Date }[];
}) {
  const userIds = [
    doc.sender.toString(),
    ...doc.reactions.map((reaction) => reaction.user.toString()),
  ];
  const entities = await findUserIdentitiesService.execute({ userIds });
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));

  const senderEntity = entitiesById.get(doc.sender.toString());

  if (!senderEntity) {
    throw new Error(`Sender ${doc.sender.toString()} could not be resolved`);
  }

  return {
    id: doc._id.toString(),
    roomId: doc.room.toString(),
    sender: senderEntity,
    text: doc.text,
    redacted: doc.redacted,
    createdAt: doc.createdAt,
    reactions: doc.reactions
      .map((reaction) => {
        const entity = entitiesById.get(reaction.user.toString());

        if (!entity) return null;

        return { entity, emoji: reaction.emoji };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null),
    readBy: doc.readBy.map((read) => ({
      userId: read.user.toString(),
      readAt: read.readAt,
    })),
  };
}

export class MessageRepo {
  static async findRoomMessages({
    roomId,
    since,
  }: {
    roomId: string;
    since?: Date;
  }): Promise<Message[]> {
    const docs = await MessageDoc.find({
      room: roomId,
      ...(since ? { createdAt: { $gt: since } } : {}),
    }).sort({ createdAt: -1 });

    return Promise.all(docs.map(async (doc) => Message.hydrate(await toMessageParams(doc))));
  }

  static async countUnreadMessages({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): Promise<number> {
    return MessageDoc.countDocuments({
      room: roomId,
      "readBy.user": { $ne: userId },
    });
  }

  static async deleteRoomMessages({ roomId }: { roomId: string }): Promise<number> {
    const result = await MessageDoc.deleteMany({ room: roomId });

    return result.deletedCount;
  }

  static async create(message: NewMessage): Promise<Message> {
    const doc = await MessageDoc.create({
      room: message.roomId,
      sender: message.sender.id,
      text: message.text,
    });

    return Message.hydrate(await toMessageParams(doc));
  }

  /**
   * Bulk-redacts every message a user sent in a room (e.g. when they're
   * removed from a group room after being blocked) - a filtered bulk
   * update, not a single-entity mutation, so it doesn't fit the
   * hydrate-mutate-update(entity) shape the other repos use.
   */
  static async redactRoomMessagesByUserId({
    userId,
    roomId,
  }: {
    userId: string;
    roomId: string;
  }): Promise<number> {
    const result = await MessageDoc.updateMany(
      { room: roomId, sender: userId },
      { redacted: true },
    );

    return result.matchedCount;
  }
}
