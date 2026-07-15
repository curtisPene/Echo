import { messagesRepo } from "../repo/messagesRepo";
import type { Message } from "../types";

export const messageReceiveService = async ({
  message,
}: {
  message: Message;
}) => {
  // Room status (pending/accepted) is a display-only concern handled by
  // useConversationListViewModel - a message is always saved regardless
  // of the room's status for the current user.
  await messagesRepo.saveMessage(message);
};
