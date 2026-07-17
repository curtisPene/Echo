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

  private constructor(id: string, name: string, participants: readonly Participant[]) {
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

  isOneOnOne(): boolean {
    return this.participants.length === 2;
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
}
