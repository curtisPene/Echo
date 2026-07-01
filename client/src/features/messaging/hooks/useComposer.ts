import { useCallback, useState } from "react";
import { sendMessageGateway } from "../gateway/messagingSocketGateway";
import { useRooms } from "@/stores/useRooms";
import { saveMessage } from "../repo/messagesRepo";

export const useComposer = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const activeRoom = useRooms((state) => state.activeRoom);
  const onSendMessage = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!activeRoom) return;
      const response = await sendMessageGateway({
        payload: { message: inputValue, roomId: activeRoom.id },
      });
      if (!response.success) return;
      saveMessage({ message: response.data.message });
      setInputValue("");
    },
    [inputValue, activeRoom],
  );

  return { inputValue, setInputValue, onSendMessage, activeRoom };
};
