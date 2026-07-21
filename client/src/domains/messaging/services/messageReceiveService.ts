import type { MessageDTO } from "../entities/message";
import type { MessagesRepository } from "../ports/MessagesRepository";

export class MessageReceiveService {
  private readonly messagesRepo: MessagesRepository;

  constructor(messagesRepo: MessagesRepository) {
    this.messagesRepo = messagesRepo;
  }

  async execute({ message }: { message: MessageDTO }) {
    // Room status (pending/accepted) is a display-only concern handled by
    // useConversationListViewModel - a message is always saved regardless
    // of the room's status for the current user.
    await this.messagesRepo.saveMessage(message);
  }
}
