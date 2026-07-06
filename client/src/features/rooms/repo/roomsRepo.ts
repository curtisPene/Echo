import { db } from "@/lib/db";
import type { Room, RoomParticipant } from "../types";

export async function syncRoomsRepo({ rooms }: { rooms: Room[] }) {
  await db.rooms.bulkPut(rooms);
}

export async function getRooms() {
  return await db.rooms.toArray();
}

export async function createNewRoomDB({
  id,
  participants,
  name,
}: {
  id: string;
  participants: RoomParticipant[];
  name: string;
}) {
  const roomKey = await db.rooms.add({
    id,
    participants,
    name,
    lastMessageAt: null,
    lastMessage: null,
    unread: 0,
  });
  return roomKey;
}
