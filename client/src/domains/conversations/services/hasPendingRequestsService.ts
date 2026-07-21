import { Room, type RoomDTO } from "../entities/room";

export class HasPendingRequestsService {
  execute({ rooms, userId }: { rooms: RoomDTO[]; userId: string | null }): boolean {
    if (!userId) return false;
    return rooms.some((dto) => Room.hydrate(dto).isPendingFor(userId));
  }
}
