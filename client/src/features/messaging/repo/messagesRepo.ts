import { db } from "@/lib/db";
import type { Message } from "../types";

export const syncMessagesRepo = async ({
  messages,
}: {
  messages: Message[];
}) => {
  await db.messages.bulkPut(messages);
};

export const saveMessage = async ({ message }: { message: Message }) => {
  await db.messages.add(message);
};
