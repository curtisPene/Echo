import { useState, type FormEvent } from "react";
import { useRooms } from "@/stores/useRooms";
import { messagingControllers } from "@/composition";

export const useComposerViewModel = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const activeRoom = useRooms((state) => state.activeRoom);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeRoom || !message.trim()) return;
    setError(null);

    const result = await messagingControllers.sendMessage({
      text: message,
      roomId: activeRoom.id,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage("");
  };

  return { message, setMessage, error, onSubmit };
};
