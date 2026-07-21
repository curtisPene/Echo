import type { RoomDTO } from "../domainModels/room";

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
