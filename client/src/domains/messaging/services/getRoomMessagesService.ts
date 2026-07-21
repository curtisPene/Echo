import type { MessageDTO } from "../entities/message";
import type { MessagesRepository } from "../ports/MessagesRepository";

export class GetRoomMessagesService {
  private readonly messagesRepo: MessagesRepository;

  constructor(messagesRepo: MessagesRepository) {
    this.messagesRepo = messagesRepo;
  }

  execute({ roomId }: { roomId: string | null }): () => Promise<MessageDTO[]> {
    if (!roomId) return () => Promise.resolve([]);
    return this.messagesRepo.queryForRoom(roomId);
  }
}
