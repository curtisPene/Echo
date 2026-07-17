import { Room as RoomDoc, RoomParticipant } from "../models/roomModel";
import { RepoError } from "../../../errors/RepoError";
import { Room, NewRoom } from "../domainModels/room";
import { findUserIdentitiesService } from "../../authAndAccess/composition";

function toPersistedParticipants(
  participants: { userId: string; status: "pending" | "accepted" }[],
): { user: string; status: "pending" | "accepted" }[] {
  return participants.map((participant) => ({
    user: participant.userId,
    status: participant.status,
  }));
}

async function toRoomParams(doc: {
  _id: { toString(): string };
  name: string;
  participants: RoomParticipant[];
}) {
  const userIds = doc.participants.map((participant) => participant.user.toString());
  const entities = await findUserIdentitiesService.execute({ userIds });
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));

  return {
    id: doc._id.toString(),
    name: doc.name,
    participants: doc.participants
      .map((participant) => {
        const entity = entitiesById.get(participant.user.toString());

        if (!entity) return null;

        return { entity, status: participant.status ?? ("pending" as const) };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null),
  };
}

export class RoomRepo {
  static async findById({ roomId }: { roomId: string }): Promise<Room | null> {
    const doc = await RoomDoc.findById(roomId);

    if (!doc) return null;

    return Room.hydrate(await toRoomParams(doc));
  }

  static async findRoomsWithUserId({
    userId,
    since,
  }: {
    userId: string;
    since?: Date;
  }): Promise<Room[]> {
    const docs = await RoomDoc.find({
      participants: { $elemMatch: { user: userId } },
      ...(since ? { updatedAt: { $gt: since } } : {}),
    });

    return Promise.all(docs.map(async (doc) => Room.hydrate(await toRoomParams(doc))));
  }

  static async create(room: NewRoom): Promise<Room> {
    const doc = await RoomDoc.create({
      name: room.name,
      participants: toPersistedParticipants(
        room.participants.map((p) => ({ userId: p.entity.id, status: p.status })),
      ),
    });

    return Room.hydrate({
      id: doc._id.toString(),
      name: doc.name,
      participants: room.participants,
    });
  }

  /**
   * Persists a Room already mutated via its domain model methods - the
   * caller already holds the correct, current Room instance, so this just
   * writes it and returns the same instance. No re-hydration: hydrate only
   * happens when reading fresh data out of storage, never on update.
   */
  static async update(room: Room): Promise<Room> {
    const result = await RoomDoc.updateOne(
      { _id: room.id },
      {
        $set: {
          name: room.name,
          participants: toPersistedParticipants(room.getParticipants()),
        },
      },
    );

    if (result.matchedCount === 0) throw new RepoError("Room not found");

    return room;
  }

  static async deleteById({ roomId }: { roomId: string }): Promise<boolean> {
    const result = await RoomDoc.deleteOne({ _id: roomId });

    return result.deletedCount > 0;
  }
}
