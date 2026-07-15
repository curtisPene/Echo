import { useState } from "react";
import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";
import { getConversationDetailsService } from "../services/getConversationDetailsService";

export const useConversationDetailsViewModel = () => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const activeRoom = useRooms((state) => state.activeRoom);
  const rooms = useRooms((state) => state.rooms);
  const currentUserId = useAuth((state) => state.user?.id);

  const room = getConversationDetailsService({
    rooms,
    activeRoomId: activeRoom?.id ?? null,
    currentUserId: currentUserId ?? "",
  });

  return { room, isDetailsVisible, setIsDetailsVisible };
};
