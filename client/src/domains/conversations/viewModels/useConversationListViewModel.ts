import { useAuth } from "@/stores/useAuth";
import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";
import { useRoomUnreadCounts } from "@/stores/useRoomUnreadCounts";
import { roomsControllers } from "@/composition";
import { toRoomListEntry } from "../presentation/roomPresentation";

export const useConversationListViewModel = () => {
  const rooms = useRooms((state) => state.rooms);
  const messages = useMessages((state) => state.messages);
  const unreadCounts = useRoomUnreadCounts((state) => state.unreadCounts);
  const currentUserId = useAuth((state) => state.user?.id);

  const entries = rooms.map((room) =>
    toRoomListEntry(room, { currentUserId: currentUserId ?? "", messages, unreadCounts }),
  );

  return {
    rooms: entries.filter((entry) => entry.myStatus === "accepted"),
    pendingRooms: entries.filter((entry) => entry.myStatus === "pending"),
    selectRoom: roomsControllers.selectRoom,
    clearActiveRoom: roomsControllers.clearActiveRoom,
  };
};
