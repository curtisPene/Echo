import { MessageDTO } from "../entities/message";
import { MessageRepo } from "../repo/mongooseMessageRepo";
import { RoomDTO } from "../../conversations/entities/room";

export class FindRoomMessagesService {
  constructor(private readonly messageRepo: MessageRepo) {}

  async execute({
    room,
    userId,
    since,
  }: {
    room: RoomDTO;
    userId: string;
    since?: Date;
  }): Promise<{ messages: MessageDTO[]; unread: number }> {
    const [messages, unread] = await Promise.all([
      this.messageRepo.findRoomMessages({ roomId: room.id, since }),
      this.messageRepo.countUnreadMessages({ roomId: room.id, userId }),
    ]);

    return {
      messages: messages.map((message) => message.toDTO(room)),
      unread,
    };
  }
}
