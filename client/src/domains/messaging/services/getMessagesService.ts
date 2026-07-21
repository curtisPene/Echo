import type { MessagesRepository } from "../ports/MessagesRepository";

export class GetMessagesService {
  private readonly messagesRepo: MessagesRepository;

  constructor(messagesRepo: MessagesRepository) {
    this.messagesRepo = messagesRepo;
  }

  async execute() {
    return await this.messagesRepo.getMessages();
  }
}
