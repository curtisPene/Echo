import { DomainError } from "../../../errors/DomainError";
import type { RoomDTO } from "../../conversations/entities/room";

// "sending"/"failed" only ever exist client-side (optimistic local state
// before/if the server round-trip settles) - the server never stores or
// derives them. Server-derived status is always "sent" | "delivered" |
// "read", computed fresh from deliveredTo/readBy vs. the room's live
// other-participant list (see getDeliveryStatus below) - never stored as
// its own field, so it can never go stale if room membership changes after
// the message was sent (see project_architectural_insights memory for the
// full reasoning).
export type DeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface SenderEntity {
  id: string;
  firstName: string;
  lastName: string;
}

class Sender {
  private constructor(
    readonly userId: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {}

  static hydrate(entity: SenderEntity): Sender {
    return new Sender(entity.id, entity.firstName, entity.lastName);
  }
}

export interface ReactorEntity {
  id: string;
  firstName: string;
  lastName: string;
}

class Reaction {
  private constructor(
    readonly userId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly emoji: string,
  ) {}

  static hydrate(entity: ReactorEntity, emoji: string): Reaction {
    return new Reaction(entity.id, entity.firstName, entity.lastName, emoji);
  }
}

interface Read {
  userId: string;
  readAt: Date;
}

export interface SenderDTO {
  userId: string;
  firstName: string;
  lastName: string;
}

export interface ReactionDTO {
  userId: string;
  firstName: string;
  lastName: string;
  emoji: string;
}

export interface ReadDTO {
  userId: string;
  readAt: Date;
}

export interface MessageDTO {
  id: string;
  roomId: string;
  sender: SenderDTO;
  text: string;
  redacted: boolean;
  createdAt: Date;
  reactions: ReactionDTO[];
  readBy: ReadDTO[];
  deliveredTo: string[];
  deliveryStatus: DeliveryStatus;
}

export interface NewMessage {
  roomId: string;
  sender: SenderEntity;
  text: string;
}

export class Message {
  private constructor(
    readonly id: string,
    readonly roomId: string,
    private readonly sender: Sender,
    readonly text: string,
    readonly redacted: boolean,
    readonly createdAt: Date,
    private readonly reactions: readonly Reaction[],
    private readonly readBy: readonly Read[],
    private readonly deliveredTo: readonly string[],
  ) {}

  static hydrate(params: {
    id: string;
    roomId: string;
    sender: SenderEntity;
    text: string;
    redacted: boolean;
    createdAt: Date;
    reactions: { entity: ReactorEntity; emoji: string }[];
    readBy: { userId: string; readAt: Date }[];
    deliveredTo: string[];
  }): Message {
    return new Message(
      params.id,
      params.roomId,
      Sender.hydrate(params.sender),
      params.text,
      params.redacted,
      params.createdAt,
      params.reactions.map((r) => Reaction.hydrate(r.entity, r.emoji)),
      params.readBy,
      params.deliveredTo,
    );
  }

  static create(params: NewMessage): NewMessage {
    return { ...params };
  }

  isReadBy(userId: string): boolean {
    return this.readBy.some((r) => r.userId === userId);
  }

  /**
   * Plain-data accessors for every field this repo's update() persists -
   * the repo must write the full current domain state on every update
   * (see MessageRepo.update), never just whichever field the calling
   * service happened to touch, so it needs a read for each of them. Same
   * pattern as Room.getParticipants().
   */
  getDeliveredTo(): string[] {
    return [...this.deliveredTo];
  }

  getReadBy(): ReadDTO[] {
    return this.readBy.map((r) => ({ userId: r.userId, readAt: r.readAt }));
  }

  getReactions(): ReactionDTO[] {
    return this.reactions.map((r) => ({
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      emoji: r.emoji,
    }));
  }

  /**
   * Records that userId has received this message. Returns a new Message -
   * the only valid way to mutate deliveredTo, matching Participant.accept()'s
   * immutable-update pattern. roomDTO must be the room this message actually
   * belongs to (verified by id) - the caller (MessageStatusUpdateService)
   * is responsible for loading it fresh, live, from conversations, never
   * from a client-supplied or cached value.
   */
  markDelivered(roomDTO: RoomDTO, userId: string): Message {
    if (roomDTO.id !== this.roomId) {
      throw new DomainError(
        `Room ${roomDTO.id} does not match message ${this.id}'s room ${this.roomId}`,
      );
    }

    if (this.deliveredTo.includes(userId)) return this;

    return new Message(
      this.id,
      this.roomId,
      this.sender,
      this.text,
      this.redacted,
      this.createdAt,
      this.reactions,
      this.readBy,
      [...this.deliveredTo, userId],
    );
  }

  /**
   * Records that userId has read this message. Returns a new Message - same
   * immutable-update/room-verification pattern as markDelivered. Does not
   * also add userId to deliveredTo - the two arrays are tracked and checked
   * independently, even though reading implies having received it, since
   * getDeliveryStatus below only needs to know the highest state reached
   * per user's read status, not force delivery bookkeeping to stay in sync.
   */
  markRead(roomDTO: RoomDTO, userId: string): Message {
    if (roomDTO.id !== this.roomId) {
      throw new DomainError(
        `Room ${roomDTO.id} does not match message ${this.id}'s room ${this.roomId}`,
      );
    }

    if (this.isReadBy(userId)) return this;

    return new Message(
      this.id,
      this.roomId,
      this.sender,
      this.text,
      this.redacted,
      this.createdAt,
      this.reactions,
      [...this.readBy, { userId, readAt: new Date() }],
      this.deliveredTo,
    );
  }

  /**
   * Derived, never stored - "read" means readBy covers every OTHER
   * participant, "delivered" means deliveredTo does (the sender never
   * needs to deliver/read their own message). Computed fresh against the
   * room's live participant list every time, so it can never go stale if
   * room membership changes after the message was sent (someone added/
   * removed later). A self-chat (no other participants) is trivially
   * "read" - both conditions hold vacuously with zero other participants,
   * no special case needed.
   */
  private getDeliveryStatus(roomDTO: RoomDTO): "sent" | "delivered" | "read" {
    const otherParticipantIds = roomDTO.participants
      .map((p) => p.userId)
      .filter((userId) => userId !== this.sender.userId);

    const isRead = otherParticipantIds.every((userId) =>
      this.isReadBy(userId),
    );
    if (isRead) return "read";

    const isDelivered = otherParticipantIds.every((userId) =>
      this.deliveredTo.includes(userId),
    );

    return isDelivered ? "delivered" : "sent";
  }

  /**
   * The domain's own canonical, presentable shape - the single place this
   * aggregate defines how it looks to any caller (controller, cross-domain
   * service, ...). Reads its own private fields directly since Sender/
   * Reaction are defined in this same module - no intermediate getters
   * needed. Takes the room's DTO to derive deliveryStatus - see
   * getDeliveryStatus above for why this can't be computed without it.
   */
  toDTO(roomDTO: RoomDTO): MessageDTO {
    return {
      id: this.id,
      roomId: this.roomId,
      sender: {
        userId: this.sender.userId,
        firstName: this.sender.firstName,
        lastName: this.sender.lastName,
      },
      text: this.text,
      redacted: this.redacted,
      createdAt: this.createdAt,
      reactions: this.reactions.map((r) => ({
        userId: r.userId,
        firstName: r.firstName,
        lastName: r.lastName,
        emoji: r.emoji,
      })),
      readBy: this.readBy.map((r) => ({ userId: r.userId, readAt: r.readAt })),
      deliveredTo: [...this.deliveredTo],
      deliveryStatus: this.getDeliveryStatus(roomDTO),
    };
  }
}
