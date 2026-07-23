import { Message as MessageDoc } from "../models/messageModel";
import { Message, NewMessage } from "../entities/message";
import { FindUserIdentitiesService } from "../../authAndAccess/services/FindUserIdentitiesService";
import { RepoError } from "../../../errors/RepoError";

export class MessageRepo {
  constructor(
    private readonly findUserIdentitiesService: FindUserIdentitiesService,
  ) {}

  private async toMessageParams(doc: {
    _id: { toString(): string };
    room: { toString(): string };
    sender: { toString(): string };
    text: string;
    redacted: boolean;
    createdAt: Date;
    reactions: { user: { toString(): string }; emoji: string }[];
    readBy: { user: { toString(): string }; readAt: Date }[];
    deliveredTo: { toString(): string }[];
  }) {
    const userIds = [
      doc.sender.toString(),
      ...doc.reactions.map((reaction) => reaction.user.toString()),
    ];
    const entities = await this.findUserIdentitiesService.execute({ userIds });
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
      deliveredTo: doc.deliveredTo.map((userId) => userId.toString()),
    };
  }

  async findById({
    messageId,
  }: {
    messageId: string;
  }): Promise<Message | null> {
    const doc = await MessageDoc.findById(messageId);

    if (!doc) return null;

    return Message.hydrate(await this.toMessageParams(doc));
  }

  async findRoomMessages({
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

    return Promise.all(
      docs.map(async (doc) => Message.hydrate(await this.toMessageParams(doc))),
    );
  }

  async countUnreadMessages({
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

  async deleteRoomMessages({ roomId }: { roomId: string }): Promise<number> {
    const result = await MessageDoc.deleteMany({ room: roomId });

    return result.deletedCount;
  }

  async create(message: NewMessage): Promise<Message> {
    const doc = await MessageDoc.create({
      room: message.roomId,
      sender: message.sender.id,
      text: message.text,
    });

    return Message.hydrate(await this.toMessageParams(doc));
  }

  /**
   * Persists a Message already mutated via its domain model methods - the
   * caller already holds the correct, current Message instance, so this
   * writes every field the domain model itself can mutate, not just
   * whichever one the calling service happened to touch. Writing a single
   * field at a time here would put per-field update logic in the DB layer
   * instead of the domain model - same reasoning as Room.update.
   */
  async update(message: Message): Promise<Message> {
    const result = await MessageDoc.updateOne(
      { _id: message.id },
      {
        $set: {
          redacted: message.redacted,
          reactions: message.getReactions().map((r) => ({
            user: r.userId,
            emoji: r.emoji,
          })),
          readBy: message.getReadBy().map((r) => ({
            user: r.userId,
            readAt: r.readAt,
          })),
          deliveredTo: message.getDeliveredTo(),
        },
      },
    );

    if (result.matchedCount === 0) throw new RepoError("Message not found");

    return message;
  }

  /**
   * Bulk-redacts every message a user sent in a room (e.g. when they're
   * removed from a group room after being blocked) - a filtered bulk
   * update, not a single-entity mutation, so it doesn't fit the
   * hydrate-mutate-update(entity) shape the other repos use.
   */
  async redactRoomMessagesByUserId({
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
