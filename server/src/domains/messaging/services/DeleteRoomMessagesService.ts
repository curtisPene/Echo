import { MessageRepo } from "../repo/mongooseMessageRepo";

export class DeleteRoomMessagesService {
  constructor(private readonly messageRepo: MessageRepo) {}

  async execute({ roomId }: { roomId: string }): Promise<number> {
    return this.messageRepo.deleteRoomMessages({ roomId });
  }
}
