import { useCallback } from "react";
import { useRooms } from "@/stores/useRooms";
import { sendMessageService } from "../services/sendMessageService";

export const useComposer = () => {
  const activeRoom = useRooms((state) => state.activeRoom);

  const onSendMessage = useCallback(
    async (message: string, onComplete: () => void) => {
      if (!activeRoom) return;
      const serviceResult = await sendMessageService({
        message,
        roomId: activeRoom.id,
      });

      if (!serviceResult.success) return;

      onComplete();
    },
    [activeRoom],
  );

  return { onSendMessage, activeRoom };
};
