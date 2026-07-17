import { RoomDTO } from "../domainModels/room";
import { RoomRepo } from "../repo/mongooseRoomRepo";

export class RemoveParticipantFromRoomService {
  async execute({ roomId, userId }: { roomId: string; userId: string }): Promise<RoomDTO | null> {
    const room = await RoomRepo.findById({ roomId });

    if (!room) return null;

    const updated = room.removeParticipant(userId);
    const saved = await RoomRepo.update(updated);

    return saved.toDTO();
  }
}
