import { RoomRepo } from "../repo/mongooseRoomRepo";

export class DeleteRoomService {
  async execute({ roomId }: { roomId: string }): Promise<boolean> {
    return RoomRepo.deleteById({ roomId });
  }
}
