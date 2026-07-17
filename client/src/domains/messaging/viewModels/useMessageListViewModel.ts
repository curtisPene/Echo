import { useAuth } from "@/stores/useAuth";
import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";
import { getConversationDetailsService } from "@/domains/conversations/services/getConversationDetailsService";
import { getRoomMessagesService } from "../services/getRoomMessagesService";

export const useMessageListViewModel = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const rooms = useRooms((state) => state.rooms);
  const messages = useMessages((state) => state.messages);
  const currentUserId = useAuth((state) => state.user?.id);

  const room = getConversationDetailsService({
    rooms,
    activeRoomId: activeRoom?.id ?? null,
    currentUserId: currentUserId ?? "",
  });

  const messagesInActiveRoom = getRoomMessagesService({
    messages,
    roomId: activeRoom?.id ?? null,
  });

  return {
    messages: messagesInActiveRoom,
    activeRoom,
    isRoomAccepted: room?.myStatus === "accepted",
  };
};
