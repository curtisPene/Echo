import { MessageDTO } from "../domainModels/message";
import { MessageRepo } from "../repo/mongooseMessageRepo";

export class FindRoomMessagesService {
  constructor(private readonly messageRepo: MessageRepo) {}

  async execute({
    roomId,
    userId,
    since,
  }: {
    roomId: string;
    userId: string;
    since?: Date;
  }): Promise<{ messages: MessageDTO[]; unread: number }> {
    const [messages, unread] = await Promise.all([
      this.messageRepo.findRoomMessages({ roomId, since }),
      this.messageRepo.countUnreadMessages({ roomId, userId }),
    ]);

    return {
      messages: messages.map((message) => message.toDTO()),
      unread,
    };
  }
}
