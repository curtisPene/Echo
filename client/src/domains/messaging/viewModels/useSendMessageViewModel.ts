import { useState } from "react";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { messagingControllers } from "@/composition";

export const useSendMessageViewModel = () => {
  const activeRoom = useActiveRoom((state) => state.activeRoom);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!activeRoom || !text.trim()) return;
    setIsSending(true);
    setError(null);

    const result = await messagingControllers.sendMessage({
      text,
      roomId: activeRoom.id,
    });

    if (!result.success) {
      setError(result.message);
    } else {
      setText("");
    }

    setIsSending(false);
  };

  return { text, setText, error, isSending, sendMessage };
};
