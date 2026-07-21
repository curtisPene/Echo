import type { Room } from "../entities/room";
import type { RoomsRepository } from "../ports/RoomsRepository";

export class GetConversationDetailsService {
  private readonly roomsRepo: RoomsRepository;

  constructor(roomsRepo: RoomsRepository) {
    this.roomsRepo = roomsRepo;
  }

  execute({
    activeRoomId,
  }: {
    activeRoomId: string | null;
  }): () => Promise<Room | undefined> {
    if (!activeRoomId) return () => Promise.resolve(undefined);
    return () => this.roomsRepo.findById(activeRoomId);
  }
}
