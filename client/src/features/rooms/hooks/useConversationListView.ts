import type { Room } from "@/features/rooms/types";
import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";

export const useConversationListView = () => {
  const rooms = useRooms((state) => state.rooms);
  const userId = useAuth((state) => state.user?.id);

  const myStatus = (room: Room) =>
    room.participants.find((participant) => participant.user.id === userId)
      ?.status;

  const pendingRooms = rooms.filter((room) => myStatus(room) === "pending");
  const acceptedRooms = rooms.filter((room) => myStatus(room) === "accepted");

  return { rooms: acceptedRooms, pendingRooms };
};
