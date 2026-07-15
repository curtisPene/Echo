import { db } from "@/infrastructure/sync/db";
import type { Room, RoomParticipant } from "../types";

export async function syncRoomsRepo({
  rooms,
}: {
  rooms: { room: Room; unread: number }[];
}) {
  await db.rooms.bulkPut(rooms.map(({ room }) => room));
  await db.roomUnreadCounts.bulkPut(
    rooms.map(({ room, unread }) => ({ roomId: room.id, unread })),
  );
}

export async function getRooms() {
  return await db.rooms.toArray();
}

export async function createNewRoomDB({
  roomId,
  participants,
  name,
}: {
  roomId: string;
  participants: RoomParticipant[];
  name: string;
}) {
  const roomKey = await db.rooms.add({
    id: roomId,
    participants,
    name,
  });
  return roomKey;
}

export const getRoomByIdDB = async (roomId: string) => {
  const room = await db.rooms.get(roomId);

  return room;
};

export const updateRoomDB = async (room: Room) => {
  await db.rooms.put(room);
};

export const getRoomUnreadCount = async (roomId: string) => {
  const unreadCount = await db.roomUnreadCounts.get(roomId);

  return unreadCount;
};
