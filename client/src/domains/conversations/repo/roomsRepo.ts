import { db } from "@/infrastructure/sync/db";
import type { RoomDTO, ParticipantDTO } from "../types";

export const roomsRepo = {
  async sync({ rooms }: { rooms: { room: RoomDTO; unread: number }[] }) {
    await db.rooms.bulkPut(rooms.map(({ room }) => room));
    await db.roomUnreadCounts.bulkPut(
      rooms.map(({ room, unread }) => ({ roomId: room.id, unread })),
    );
  },

  async getRooms() {
    return await db.rooms.toArray();
  },

  async getRoomById(roomId: string) {
    return await db.rooms.get(roomId);
  },

  async createRoom({
    roomId,
    participants,
    name,
  }: {
    roomId: string;
    participants: ParticipantDTO[];
    name: string;
  }) {
    return await db.rooms.add({ id: roomId, participants, name });
  },

  async updateRoom(room: RoomDTO) {
    await db.rooms.put(room);
  },

  async getUnreadCount(roomId: string) {
    return await db.roomUnreadCounts.get(roomId);
  },
};
