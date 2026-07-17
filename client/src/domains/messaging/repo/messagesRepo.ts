import { db } from "@/infrastructure/sync/db";
import type { MessageDTO } from "../types";

export const messagesRepo = {
  async sync(messages: MessageDTO[]) {
    await db.messages.bulkPut(messages);
  },

  async saveMessage(message: MessageDTO) {
    await db.messages.put(message);
  },

  async getMessages() {
    return await db.messages.toArray();
  },
};
