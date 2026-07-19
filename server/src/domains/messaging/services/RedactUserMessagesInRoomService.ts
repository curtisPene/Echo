import { MessageRepo } from "../repo/mongooseMessageRepo";

export class RedactUserMessagesInRoomService {
  constructor(private readonly messageRepo: MessageRepo) {}

  async execute({ userId, roomId }: { userId: string; roomId: string }): Promise<number> {
    return this.messageRepo.redactRoomMessagesByUserId({ userId, roomId });
  }
}
