import { RoomRepo } from "../repo/mongooseRoomRepo";

export class DeleteRequestService {
  constructor(private readonly roomRepo: RoomRepo) {}

  async execute({ userId, roomId }: { userId: string; roomId: string }) {
    try {
      const room = await this.roomRepo.findById({ roomId });
    } catch (error) {}
  }
}
