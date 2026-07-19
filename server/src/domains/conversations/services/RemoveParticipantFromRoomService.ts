import { RoomDTO } from "../domainModels/room";
import { RoomRepository } from "../ports/RoomRepository";

export class RemoveParticipantFromRoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async execute({ roomId, userId }: { roomId: string; userId: string }): Promise<RoomDTO | null> {
    const room = await this.roomRepo.findById({ roomId });

    if (!room) return null;

    const updated = room.removeParticipant(userId);
    const saved = await this.roomRepo.update(updated);

    return saved.toDTO();
  }
}
