import { saveMessageDB } from "../repo/messagesRepo";
import type { Message } from "../types";

export const messageReceiveService = async ({
  message,
}: {
  message: Message;
}) => {
  // Room status (pending/accepted) is a display-only concern handled at
  // render time by useConversationListView - a message is always saved
  // regardless of the room's status for the current user.
  await saveMessageDB({ message });
};
