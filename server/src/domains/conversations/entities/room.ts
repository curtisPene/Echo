import { DomainError } from "../../../errors/DomainError";

export interface ParticipantEntity {
  id: string;
  firstName: string;
  lastName: string;
}

class Participant {
  private constructor(
    readonly userId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly status: "pending" | "accepted",
  ) {}

  static hydrate(
    entity: ParticipantEntity,
    status: "pending" | "accepted",
  ): Participant {
    return new Participant(entity.id, entity.firstName, entity.lastName, status);
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

    return new Participant(this.userId, this.firstName, this.lastName, "accepted");
  }
}

export interface NewRoom {
  name: string;
  participants: { entity: ParticipantEntity; status: "pending" | "accepted" }[];
}

export interface ParticipantDTO {
  userId: string;
  firstName: string;
  lastName: string;
  status: "pending" | "accepted";
}

export interface RoomDTO {
  id: string;
  name: string;
  participants: ParticipantDTO[];
}

export class Room {
  private constructor(
    readonly id: string,
    readonly name: string,
    private readonly participants: readonly Participant[],
  ) {}

  /**
   * Reconstructs a Room from storage. Callers (the repo) must resolve
   * every participant's entity first - Room itself never reaches
   * across domains for that data, it just composes what it's handed.
   */
  static hydrate(params: {
    id: string;
    name: string;
    participants: { entity: ParticipantEntity; status: "pending" | "accepted" }[];
  }): Room {
    return new Room(
      params.id,
      params.name,
      params.participants.map((p) => Participant.hydrate(p.entity, p.status)),
    );
  }

  /**
   * Constructs a brand-new Room. The creator is auto-accepted; every other
   * participant starts pending until they accept. The caller must resolve
   * every participant's entity first.
   *
   * Self-chat (params.participants is just [creator] again, by id) is its
   * own single-participant shape rather than creator+participants - a real
   * chat-with-yourself room, not the creator appearing twice.
   */
  static create(params: {
    name: string;
    creator: ParticipantEntity;
    participants: ParticipantEntity[];
  }): NewRoom {
    const isSelfChat =
      params.participants.length === 1 &&
      params.participants[0].id === params.creator.id;

    if (isSelfChat) {
      return {
        name: params.name,
        participants: [{ entity: params.creator, status: "accepted" }],
      };
    }

    return {
      name: params.name,
      participants: [
        { entity: params.creator, status: "accepted" },
        ...params.participants.map((entity) => ({
          entity,
          status: "pending" as const,
        })),
      ],
    };
  }

  isSelfChat(): boolean {
    return this.participants.length === 1;
  }

  /**
   * Decides whether a room can be created between a creator and a set of
   * participants, given each side's blocked-id lists (fetched by the
   * caller from the contacts aggregate - Room can't reach across domains
   * to fetch them itself).
   */
  static canCreate(params: {
    creatorId: string;
    participantIds: string[];
    creatorBlockedIds: string[];
    participantBlockedIds: Map<string, string[]>;
  }):
    | { allowed: true }
    | { allowed: false; reason: "creator_blocked_participant" | "participant_blocked_creator" } {
    const creatorHasBlockedSomeParticipant = params.participantIds.some(
      (participantId) => params.creatorBlockedIds.includes(participantId),
    );

    if (creatorHasBlockedSomeParticipant) {
      return { allowed: false, reason: "creator_blocked_participant" };
    }

    const someParticipantHasBlockedCreator = params.participantIds.some(
      (participantId) =>
        (params.participantBlockedIds.get(participantId) ?? []).includes(
          params.creatorId,
        ),
    );

    if (someParticipantHasBlockedCreator) {
      return { allowed: false, reason: "participant_blocked_creator" };
    }

    return { allowed: true };
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
   * Returns the participant list as plain data - used by the repo (to
   * persist) and by toDTO(). No Participant instance ever leaves this
   * module.
   */
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
   * aggregate defines how it looks to any caller (controller, cross-domain
   * service, ...). Callers should use this instead of re-deriving a view
   * from individual getters.
   */
  toDTO(): RoomDTO {
    return {
      id: this.id,
      name: this.name,
      participants: this.getParticipants(),
    };
  }

  /**
   * Accepts a pending participant. Throws if the participant isn't found,
   * delegating the pending->accepted transition itself to Participant.
   */
  acceptParticipant(userId: string): Room {
    const participant = this.findParticipant(userId);

    if (!participant) {
      throw new DomainError(`Cannot accept participant ${userId}: not found in room ${this.id}`);
    }

    const accepted = participant.accept();

    return new Room(
      this.id,
      this.name,
      this.participants.map((p) => (p.userId === userId ? accepted : p)),
    );
  }

  /**
   * Removes a participant from the room entirely (e.g. when they get
   * blocked out of a group room).
   */
  removeParticipant(userId: string): Room {
    if (!this.hasParticipant(userId)) {
      throw new DomainError(`Cannot remove participant ${userId}: not found in room ${this.id}`);
    }

    return new Room(
      this.id,
      this.name,
      this.participants.filter((p) => p.userId !== userId),
    );
  }

  /**
   * Adds a new participant, pending until they accept - the same status a
   * participant starts with on room creation. Any accepted participant can
   * add anyone; there is no admin/creator role on Room.
   */
  addParticipant(entity: ParticipantEntity): Room {
    if (this.hasParticipant(entity.id)) {
      throw new DomainError(`Cannot add participant ${entity.id}: already in room ${this.id}`);
    }

    return new Room(
      this.id,
      this.name,
      [...this.participants, Participant.hydrate(entity, "pending")],
    );
  }

  /**
   * Decides whether a new participant can be added, given every EXISTING
   * participant's blocked-id list (accepted or still pending - a pending
   * invite still counts, same contract room creation already upholds) and
   * the new participant's own blocked-id list. Blocked in either direction,
   * by anyone already on the room, blocks the add.
   */
  canAddParticipant(params: {
    newParticipantId: string;
    newParticipantBlockedIds: string[];
    existingParticipantBlockedIds: Map<string, string[]>;
  }):
    | { allowed: true }
    | {
        allowed: false;
        reason: "new_participant_blocked_existing" | "existing_participant_blocked_new";
      } {
    if (this.participants.some((p) => params.newParticipantBlockedIds.includes(p.userId))) {
      return { allowed: false, reason: "new_participant_blocked_existing" };
    }

    const someExistingHasBlockedNew = this.participants.some((p) =>
      (params.existingParticipantBlockedIds.get(p.userId) ?? []).includes(
        params.newParticipantId,
      ),
    );

    if (someExistingHasBlockedNew) {
      return { allowed: false, reason: "existing_participant_blocked_new" };
    }

    return { allowed: true };
  }

  /**
   * Renames the room. Any accepted participant can rename it; there is no
   * admin/creator role on Room, same as add/removeParticipant.
   */
  rename(name: string): Room {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      throw new DomainError(`Cannot rename room ${this.id}: name cannot be empty`);
    }

    return new Room(this.id, trimmed, this.participants);
  }
}
