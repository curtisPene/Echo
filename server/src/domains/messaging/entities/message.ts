export type DeliveryStatus = "sending" | "sent" | "delivered" | "failed";

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
    readonly deliveryStatus: DeliveryStatus,
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
    deliveryStatus: DeliveryStatus;
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
      params.deliveryStatus,
    );
  }

  static create(params: NewMessage): NewMessage {
    return { ...params };
  }

  isReadBy(userId: string): boolean {
    return this.readBy.some((r) => r.userId === userId);
  }

  /**
   * The domain's own canonical, presentable shape - the single place this
   * aggregate defines how it looks to any caller (controller, cross-domain
   * service, ...). Reads its own private fields directly since Sender/
   * Reaction are defined in this same module - no intermediate getters
   * needed.
   */
  toDTO(): MessageDTO {
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
      deliveryStatus: this.deliveryStatus,
    };
  }
}
