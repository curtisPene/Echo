import { RoomRepository } from "../ports/RoomRepository";

export class DeleteRoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async execute({ roomId }: { roomId: string }): Promise<boolean> {
    return this.roomRepo.deleteById({ roomId });
  }
}
