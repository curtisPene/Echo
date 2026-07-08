import { useCallback, useState } from "react";
import { useRooms } from "@/stores/useRooms";
import { sendMessageService } from "../services/sendMessageService";

export const useComposer = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const [inputValue, setInputValue] = useState<string>("");

  const onSendMessage = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!activeRoom) return;
      const serviceResult = await sendMessageService({
        message: inputValue,
        roomId: activeRoom.id,
      });

      if (!serviceResult.success) return;

      setInputValue("");
    },
    [inputValue, activeRoom],
  );

  return { inputValue, setInputValue, onSendMessage, activeRoom };
};
