import { useAuth } from "@/stores/useAuth";
import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";

export const useConversationView = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const messages = useMessages((state) => state.messages);
  const { user } = useAuth();

  if (!user) throw new Error("User not found");

  const roomMessages = activeRoom
    ? messages.filter((message) => message.room === activeRoom.id)
    : null;

  return { roomMessages, user, activeRoom };
};
