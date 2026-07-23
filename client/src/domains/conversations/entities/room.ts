import { DomainError } from "@/errors/DomainError";

export interface ParticipantDTO {
  userId: string;
  firstName: string;
  lastName: string;
  status: "pending" | "accepted";
}

class Participant {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: "pending" | "accepted";

  private constructor(dto: ParticipantDTO) {
    this.userId = dto.userId;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.status = dto.status;
  }

  static hydrate(dto: ParticipantDTO): Participant {
    return new Participant(dto);
  }

  /**
   * Accepts a pending participant. The only valid status transition -
   * throws if not currently pending.
   */
  accept(): Participant {
    if (this.status !== "pending") {
      throw new DomainError(
        `Cannot accept participant ${this.userId}: not pending`,
      );
    }

    return new Participant({
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      status: "accepted",
    });
  }
}

export interface RoomDTO {
  id: string;
  name: string;
  participants: ParticipantDTO[];
}

export class Room {
  readonly id: string;
  readonly name: string;
  private readonly participants: readonly Participant[];

  private constructor(
    id: string,
    name: string,
    participants: readonly Participant[],
  ) {
    this.id = id;
    this.name = name;
    this.participants = participants;
  }

  static hydrate(dto: RoomDTO): Room {
    return new Room(
      dto.id,
      dto.name,
      dto.participants.map((p) => Participant.hydrate(p)),
    );
  }

  private findParticipant(userId: string): Participant | undefined {
    return this.participants.find((p) => p.userId === userId);
  }

  hasParticipant(userId: string): boolean {
    return this.findParticipant(userId) !== undefined;
  }

  // Thin today (just a length check), but the name is the point: it's a
  // domain concept (1:1 vs. group conversation), not an implementation
  // detail - callers ask "is this a 1:1" rather than compare a length,
  // so if the definition of "1:1" ever changes only this method changes.
  isOneOnOne(): boolean {
    return this.participants.length === 2;
  }

  // Mirrors the server's Room.isSelfChat() - needed so the client's own
  // create-room dedup check (CreateNewRoomService) can apply the exact
  // same domain rule the server enforces authoritatively, including the
  // self-chat case.
  isSelfChat(): boolean {
    return this.participants.length === 1;
  }

  /**
   * The current user's own membership status in this room - "pending" if
   * they're not a participant at all (defensive default; shouldn't happen
   * for a room the client has synced).
   */
  statusFor(userId: string): "pending" | "accepted" {
    return this.findParticipant(userId)?.status ?? "pending";
  }

  isPendingFor(userId: string): boolean {
    return this.statusFor(userId) === "pending";
  }

  /**
   * Accepts a pending participant. Throws if the participant isn't found,
   * delegating the pending->accepted transition itself to Participant.
   */
  acceptParticipant(userId: string): Room {
    const participant = this.findParticipant(userId);

    if (!participant) {
      throw new DomainError(
        `Cannot accept participant ${userId}: not found in room ${this.id}`,
      );
    }

    const accepted = participant.accept();

    return new Room(
      this.id,
      this.name,
      this.participants.map((p) => (p.userId === userId ? accepted : p)),
    );
  }

  /**
   * Returns every participant except the given user, as plain data - the
   * only way outside code can read participant state. No Participant
   * instance ever leaves this module.
   */
  getOtherParticipants(userId: string): ParticipantDTO[] {
    return this.getParticipants().filter((p) => p.userId !== userId);
  }

  getParticipants(): ParticipantDTO[] {
    return this.participants.map((p) => ({
      userId: p.userId,
      firstName: p.firstName,
      lastName: p.lastName,
      status: p.status,
    }));
  }

  /**
   * The domain's own canonical, presentable shape - the single place this
   * aggregate defines how it looks to any caller.
   */
  toDTO(): RoomDTO {
    return {
      id: this.id,
      name: this.name,
      participants: this.getParticipants(),
    };
  }
}
