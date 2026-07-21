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

  private constructor(
    id: string,
    roomId: string,
    sender: Sender | null,
    text: string | null,
    redacted: boolean,
    createdAt: string,
    reactions: readonly Reaction[] | null,
    readBy: readonly ReadDTO[] | null,
  ) {
    this.id = id;
    this.roomId = roomId;
    this.sender = sender;
    this.text = text;
    this.redacted = redacted;
    this.createdAt = createdAt;
    this.reactions = reactions;
    this.readBy = readBy;
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
    );
  }

  isOwnMessage(userId: string): boolean {
    return this.sender?.userId === userId;
  }

  isReadBy(userId: string): boolean {
    return this.readBy?.some((r) => r.userId === userId) ?? false;
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
    } as Extract<MessageDTO, { redacted: false }>;
  }
}
