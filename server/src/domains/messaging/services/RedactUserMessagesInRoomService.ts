import { MessageRepo } from "../repo/mongooseMessageRepo";

export class RedactUserMessagesInRoomService {
  async execute({ userId, roomId }: { userId: string; roomId: string }): Promise<number> {
    return MessageRepo.redactRoomMessagesByUserId({ userId, roomId });
  }
}
