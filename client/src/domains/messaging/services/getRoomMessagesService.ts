import type { MessageDTO } from "../types";

export const getRoomMessagesService = ({
  messages,
  roomId,
}: {
  messages: MessageDTO[];
  roomId: string | null;
}): MessageDTO[] => {
  if (!roomId) return [];
  return messages.filter((message) => message.roomId === roomId);
};
