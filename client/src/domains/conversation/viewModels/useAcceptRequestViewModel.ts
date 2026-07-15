import { useCallback } from "react";
import { useRooms } from "@/stores/useRooms";
import { acceptRequestService } from "../services/acceptRequestService";

export const useAcceptRequestViewModel = () => {
  const activeRoom = useRooms((state) => state.activeRoom);

  const onAcceptRequest = useCallback(async () => {
    if (!activeRoom) return;
    await acceptRequestService({ roomId: activeRoom.id });
  }, [activeRoom]);

  return { onAcceptRequest };
};
