import { useAuth } from "@/stores/useAuth";
import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";
import { useRoomUnreadCounts } from "@/stores/useRoomUnreadCounts";
import { getConversationListService } from "../services/getConversationListService";

export const useConversationListViewModel = () => {
  const rooms = useRooms((state) => state.rooms);
  const messages = useMessages((state) => state.messages);
  const unreadCounts = useRoomUnreadCounts((state) => state.unreadCounts);
  const currentUserId = useAuth((state) => state.user?.id);

  const selectRoom = (room: { id: string; name: string }) => {
    useRooms.getState().setACtiveRoom(room);
  };

  const clearActiveRoom = () => {
    useRooms.getState().clearActiveRoom();
  };

  return {
    ...getConversationListService({
      rooms,
      messages,
      unreadCounts,
      currentUserId: currentUserId ?? "",
    }),
    selectRoom,
    clearActiveRoom,
  };
};
