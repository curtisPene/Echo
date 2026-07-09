import { useCallback } from "react";
import { acceptRequestService } from "../services/acceptRequestService";
import { useRooms } from "@/stores/useRooms";

export const useAcceptRequest = () => {
  const room = useRooms((state) => state.activeRoom);
  const onAcceptRequest = useCallback(async () => {
    if (!room) return;
    acceptRequestService({ roomId: room.id });
  }, [room]);

  return { onAcceptRequest };
};
