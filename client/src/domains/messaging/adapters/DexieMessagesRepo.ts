import { db } from "@/infrastructure/sync/db";
import type { MessageDTO } from "../entities/message";
import type { MessagesRepository } from "../ports/MessagesRepository";

export class DexieMessagesRepo implements MessagesRepository {
  async sync(messages: MessageDTO[]) {
    await db.messages.bulkPut(messages);
  }

  async saveMessage(message: MessageDTO) {
    await db.messages.put(message);
  }

  async deleteMessage(id: string) {
    await db.messages.delete(id);
  }

  async getMessages() {
    return await db.messages.toArray();
  }

  queryForRoom(roomId: string) {
    return () => db.messages.where("roomId").equals(roomId).toArray();
  }
}
