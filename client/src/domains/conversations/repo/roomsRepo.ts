import { db } from "@/infrastructure/sync/db";
import type { Room, RoomParticipant } from "../../presence/types";

export const roomsRepo = {
  async sync({ rooms }: { rooms: { room: Room; unread: number }[] }) {
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
    participants: RoomParticipant[];
    name: string;
  }) {
    return await db.rooms.add({ id: roomId, participants, name });
  },

  async updateRoom(room: Room) {
    await db.rooms.put(room);
  },

  async getUnreadCount(roomId: string) {
    return await db.roomUnreadCounts.get(roomId);
  },
};
