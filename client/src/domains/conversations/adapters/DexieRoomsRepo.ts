import { db } from "@/infrastructure/sync/db";
import { Room, type RoomDTO, type ParticipantDTO } from "../domainModels/room";
import type { RoomsRepository } from "../ports/RoomsRepository";

export class DexieRoomsRepo implements RoomsRepository {
  async sync({ rooms }: { rooms: { room: RoomDTO; unread: number }[] }) {
    await db.rooms.bulkPut(rooms.map(({ room }) => room));
    await db.roomUnreadCounts.bulkPut(
      rooms.map(({ room, unread }) => ({ roomId: room.id, unread })),
    );
  }

  async getRooms() {
    const dtos = await db.rooms.toArray();
    return dtos.map((dto) => Room.hydrate(dto));
  }

  async findById(roomId: string) {
    const dto = await db.rooms.get(roomId);
    return dto ? Room.hydrate(dto) : undefined;
  }

  async create({
    roomId,
    participants,
    name,
  }: {
    roomId: string;
    participants: ParticipantDTO[];
    name: string;
  }) {
    return await db.rooms.add({ id: roomId, participants, name });
  }

  async update(room: Room) {
    await db.rooms.put(room.toDTO());
  }

  async getUnreadCount(roomId: string) {
    return await db.roomUnreadCounts.get(roomId);
  }
}
