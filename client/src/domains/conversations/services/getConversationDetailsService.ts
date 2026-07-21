import type { RoomDTO } from "../entities/room";

export class GetConversationDetailsService {
  execute({
    rooms,
    activeRoomId,
  }: {
    rooms: RoomDTO[];
    activeRoomId: string | null;
  }): RoomDTO | null {
    if (!activeRoomId) return null;
    return rooms.find((room) => room.id === activeRoomId) ?? null;
  }
}
