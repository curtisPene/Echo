export interface SenderDTO {
  userId: string;
  firstName: string;
  lastName: string;
}

class Sender {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;

  private constructor(dto: SenderDTO) {
    this.userId = dto.userId;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
  }

  static hydrate(dto: SenderDTO): Sender {
    return new Sender(dto);
  }
}

export interface ReactionDTO {
  userId: string;
  firstName: string;
  lastName: string;
  emoji: string;
}

class Reaction {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly emoji: string;

  private constructor(dto: ReactionDTO) {
    this.userId = dto.userId;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.emoji = dto.emoji;
  }

  static hydrate(dto: ReactionDTO): Reaction {
    return new Reaction(dto);
  }
}

export interface ReadDTO {
  userId: string;
  readAt: string;
}

// "sending"/"failed" only ever exist client-side (optimistic local state
// before/if the real socket round-trip settles) - the server never sends
// these. "sent"/"delivered"/"read" come from the server, derived fresh from
// deliveredTo/readBy vs. the room's live other-participant count - see the
// server's Message.getDeliveryStatus for the full reasoning.
export type DeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type MessageDTO =
  | {
      id: string;
      roomId: string;
      redacted: false;
      sender: SenderDTO;
      text: string;
      createdAt: string;
      reactions: ReactionDTO[];
      readBy: ReadDTO[];
      deliveredTo: string[];
      deliveryStatus: DeliveryStatus;
    }
  | {
      id: string;
      roomId: string;
      redacted: true;
      sender: null;
      text: null;
      createdAt: string;
      reactions: null;
      readBy: null;
      deliveredTo: string[];
      deliveryStatus: DeliveryStatus;
    };

export class Message {
  readonly id: string;
  readonly roomId: string;
  private readonly sender: Sender | null;
  readonly text: string | null;
  readonly redacted: boolean;
  readonly createdAt: string;
  private readonly reactions: readonly Reaction[] | null;
  private readonly readBy: readonly ReadDTO[] | null;
  private readonly deliveredTo: readonly string[];
  readonly deliveryStatus: DeliveryStatus;

  private constructor(
    id: string,
    roomId: string,
    sender: Sender | null,
    text: string | null,
    redacted: boolean,
    createdAt: string,
    reactions: readonly Reaction[] | null,
    readBy: readonly ReadDTO[] | null,
    deliveredTo: readonly string[],
    deliveryStatus: DeliveryStatus,
  ) {
    this.id = id;
    this.roomId = roomId;
    this.sender = sender;
    this.text = text;
    this.redacted = redacted;
    this.createdAt = createdAt;
    this.reactions = reactions;
    this.readBy = readBy;
    this.deliveredTo = deliveredTo;
    this.deliveryStatus = deliveryStatus;
  }

  static hydrate(dto: MessageDTO): Message {
    return new Message(
      dto.id,
      dto.roomId,
      dto.sender ? Sender.hydrate(dto.sender) : null,
      dto.text,
      dto.redacted,
      dto.createdAt,
      dto.reactions ? dto.reactions.map((r) => Reaction.hydrate(r)) : null,
      dto.readBy,
      dto.deliveredTo,
      dto.deliveryStatus,
    );
  }

  isOwnMessage(userId: string): boolean {
    return this.sender?.userId === userId;
  }

  isReadBy(userId: string): boolean {
    return this.readBy?.some((r) => r.userId === userId) ?? false;
  }

  isDeliveredTo(userId: string): boolean {
    return this.deliveredTo.includes(userId);
  }

  getDeliveredTo(): string[] {
    return [...this.deliveredTo];
  }

  getSender(): SenderDTO | null {
    if (!this.sender) return null;

    return {
      userId: this.sender.userId,
      firstName: this.sender.firstName,
      lastName: this.sender.lastName,
    };
  }

  getReactions(): ReactionDTO[] | null {
    if (!this.reactions) return null;

    return this.reactions.map((r) => ({
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      emoji: r.emoji,
    }));
  }

  getReadBy(): ReadDTO[] | null {
    if (!this.readBy) return null;

    return this.readBy.map((r) => ({ userId: r.userId, readAt: r.readAt }));
  }

  /**
   * The domain's own canonical, presentable shape - the single place this
   * aggregate defines how it looks to any caller.
   */
  toDTO(): MessageDTO {
    if (this.redacted || !this.sender || this.text === null) {
      return {
        id: this.id,
        roomId: this.roomId,
        createdAt: this.createdAt,
        redacted: true,
        sender: null,
        text: null,
        reactions: null,
        readBy: null,
        deliveredTo: this.getDeliveredTo(),
        deliveryStatus: this.deliveryStatus,
      };
    }

    return {
      id: this.id,
      roomId: this.roomId,
      createdAt: this.createdAt,
      redacted: false,
      sender: this.getSender(),
      text: this.text,
      reactions: this.getReactions(),
      readBy: this.getReadBy(),
      deliveredTo: this.getDeliveredTo(),
      deliveryStatus: this.deliveryStatus,
    } as Extract<MessageDTO, { redacted: false }>;
  }
}
