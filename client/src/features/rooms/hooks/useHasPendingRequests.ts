import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";

export const useHasPendingRequests = () => {
  const rooms = useRooms((state) => state.rooms);
  const userId = useAuth((state) => state.user?.id);

  return rooms.some((room) =>
    room.participants.some(
      (participant) =>
        participant.user.id === userId && participant.status === "pending",
    ),
  );
};
