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
}

export class Message {
  readonly id: string;
  readonly roomId: string;
  private readonly sender: Sender;
  readonly text: string;
  readonly redacted: boolean;
  readonly createdAt: Date;
  private readonly reactions: readonly Reaction[];
  private readonly readBy: readonly ReadDTO[];

  private constructor(
    id: string,
    roomId: string,
    sender: Sender,
    text: string,
    redacted: boolean,
    createdAt: Date,
    reactions: readonly Reaction[],
    readBy: readonly ReadDTO[],
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
      Sender.hydrate(dto.sender),
      dto.text,
      dto.redacted,
      dto.createdAt,
      dto.reactions.map((r) => Reaction.hydrate(r)),
      dto.readBy,
    );
  }

  isOwnMessage(userId: string): boolean {
    return this.sender.userId === userId;
  }

  isReadBy(userId: string): boolean {
    return this.readBy.some((r) => r.userId === userId);
  }

  getSender(): SenderDTO {
    return {
      userId: this.sender.userId,
      firstName: this.sender.firstName,
      lastName: this.sender.lastName,
    };
  }

  getReactions(): ReactionDTO[] {
    return this.reactions.map((r) => ({
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      emoji: r.emoji,
    }));
  }

  getReadBy(): ReadDTO[] {
    return this.readBy.map((r) => ({ userId: r.userId, readAt: r.readAt }));
  }
}
