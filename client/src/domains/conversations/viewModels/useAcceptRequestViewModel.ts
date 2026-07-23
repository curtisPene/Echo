import { useCallback, useState } from "react";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { roomsControllers } from "@/composition";

export const useAcceptRequestViewModel = () => {
  const activeRoom = useActiveRoom((state) => state.activeRoom);
  const [error, setError] = useState<string | null>(null);

  const onAcceptRequest = useCallback(async () => {
    if (!activeRoom) return;
    setError(null);

    const result = await roomsControllers.acceptRequest({
      roomId: activeRoom.id,
      isAcceptRequest: true,
    });

    if (!result.success) {
      setError(result.message);
    }
  }, [activeRoom]);

  const onDeclineRequest = useCallback(async () => {
    if (!activeRoom) return;
    setError(null);

    const result = await roomsControllers.acceptRequest({
      roomId: activeRoom.id,
      isAcceptRequest: false,
    });

    if (!result.success) {
      setError(result.message);
    }
  }, [activeRoom]);

  return { onAcceptRequest, onDeclineRequest, error };
};
