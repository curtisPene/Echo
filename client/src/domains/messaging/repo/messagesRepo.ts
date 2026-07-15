import { db } from "@/infrastructure/sync/db";
import type { Message } from "../types";

export const messagesRepo = {
  async sync(messages: Message[]) {
    await db.messages.bulkPut(messages);
  },

  async saveMessage(message: Message) {
    await db.messages.put(message);
  },

  async getMessages() {
    return await db.messages.toArray();
  },
};
