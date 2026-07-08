import { saveMessageDB } from "../repo/messagesRepo";
import type { Message } from "../types";

export const messageReceiveService = async ({
  message,
}: {
  message: Message;
}) => {
  await saveMessageDB({ message });
};
