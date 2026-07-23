import type { MessageDTO } from "../entities/message";

export interface MessagesRepository {
  sync(messages: MessageDTO[]): Promise<void>;
  saveMessage(message: MessageDTO): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  getMessages(): Promise<MessageDTO[]>;
  queryForRoom(roomId: string): () => Promise<MessageDTO[]>;
}
