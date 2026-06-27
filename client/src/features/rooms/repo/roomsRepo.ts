import { db } from "@/lib/db";
import type { Room } from "../types";

export async function syncRoomsRepo({ rooms }: { rooms: Room[] }) {
  await db.rooms.bulkPut(rooms);
}
