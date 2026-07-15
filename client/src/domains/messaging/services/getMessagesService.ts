import { messagesRepo } from "../repo/messagesRepo";

export const getMessagesService = async () => {
  return await messagesRepo.getMessages();
};
