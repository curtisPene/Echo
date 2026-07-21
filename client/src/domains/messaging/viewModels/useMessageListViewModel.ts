import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";
import { getRoomMessagesService } from "@/composition";

export const useMessageListViewModel = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const messages = useMessages((state) => state.messages);

  const messagesInActiveRoom = getRoomMessagesService.execute({
    messages,
    roomId: activeRoom?.id ?? null,
  });

  return {
    messages: messagesInActiveRoom,
    activeRoom,
  };
};
