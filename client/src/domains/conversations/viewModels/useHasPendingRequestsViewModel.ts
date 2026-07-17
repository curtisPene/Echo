import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";
import { hasPendingRequestsService } from "../services/hasPendingRequestsService";

export const useHasPendingRequestsViewModel = () => {
  const rooms = useRooms((state) => state.rooms);
  const userId = useAuth((state) => state.user?.id);

  const hasPendingRequests = hasPendingRequestsService({
    rooms,
    userId: userId ?? null,
  });

  return { hasPendingRequests };
};
