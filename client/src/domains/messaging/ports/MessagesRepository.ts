import type { MessageDTO } from "../domainModels/message";

export interface MessagesRepository {
  sync(messages: MessageDTO[]): Promise<void>;
  saveMessage(message: MessageDTO): Promise<void>;
  getMessages(): Promise<MessageDTO[]>;
}
