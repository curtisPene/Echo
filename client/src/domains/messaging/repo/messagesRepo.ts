import { db } from "@/infrastructure/sync/db";
import type { Message } from "../types";

export const syncMessagesRepo = async ({
  messages,
}: {
  messages: Message[];
}) => {
  await db.messages.bulkPut(messages);
};

export const saveMessageDB = async ({ message }: { message: Message }) => {
  await db.messages.put(message);
};
