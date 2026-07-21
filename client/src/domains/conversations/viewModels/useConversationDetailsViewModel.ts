import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";
import { getConversationDetailsService } from "@/composition";

export const useConversationDetailsViewModel = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const rooms = useRooms((state) => state.rooms);
  const currentUserId = useAuth((state) => state.user?.id);

  const room = getConversationDetailsService.execute({
    rooms,
    activeRoomId: activeRoom?.id ?? null,
    currentUserId: currentUserId ?? "",
  });

  return { room };
};
