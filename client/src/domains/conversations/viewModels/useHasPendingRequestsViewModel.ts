import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";
import { hasPendingRequestsService } from "@/composition";

export const useHasPendingRequestsViewModel = () => {
  const rooms = useRooms((state) => state.rooms);
  const userId = useAuth((state) => state.user?.id);

  const hasPendingRequests = hasPendingRequestsService.execute({
    rooms,
    userId: userId ?? null,
  });

  return { hasPendingRequests };
};
