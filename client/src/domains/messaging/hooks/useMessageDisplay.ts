import { useAuth } from "@/stores/useAuth";
import { Message, type MessageDTO } from "../entities/message";

export const useMessageDisplay = (message: MessageDTO) => {
  const currentUserId = useAuth((state) => state.user?.id);
  const entity = Message.hydrate(message);

  const isOwnMessage = currentUserId ? entity.isOwnMessage(currentUserId) : false;

  return { isOwnMessage, deliveryStatus: message.deliveryStatus };
};
