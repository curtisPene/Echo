import { saveMessage } from "../repo/messagesRepo";
import type { Message } from "../types";

export const onMessageRecieve = async ({ message }: { message: Message }) => {
  await saveMessage({ message });
};

export const onMessageSend = async ({ message }: { message: Message }) => {
  console.log(message);
  // todo: implement controller
};
