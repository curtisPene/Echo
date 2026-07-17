import { MessageRepo } from "../repo/mongooseMessageRepo";

export class DeleteRoomMessagesService {
  async execute({ roomId }: { roomId: string }): Promise<number> {
    return MessageRepo.deleteRoomMessages({ roomId });
  }
}
