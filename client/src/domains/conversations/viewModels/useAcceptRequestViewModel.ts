import { useCallback, useState } from "react";
import { useRooms } from "@/stores/useRooms";
import { acceptRequestController } from "../controllers/AcceptRequestController";

export const useAcceptRequestViewModel = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const [error, setError] = useState<string | null>(null);

  const onAcceptRequest = useCallback(async () => {
    if (!activeRoom) return;
    setError(null);

    const result = await acceptRequestController({ roomId: activeRoom.id });

    if (!result.success) {
      setError(result.message);
    }
  }, [activeRoom]);

  return { onAcceptRequest, error };
};
