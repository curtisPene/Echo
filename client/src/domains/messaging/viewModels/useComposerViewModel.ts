import { useState, type FormEvent } from "react";
import { useRooms } from "@/stores/useRooms";
import { sendMessageService } from "../services/sendMessageService";

export const useComposerViewModel = () => {
  const [message, setMessage] = useState("");
  const activeRoom = useRooms((state) => state.activeRoom);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeRoom || !message.trim()) return;

    const result = await sendMessageService({
      message,
      roomId: activeRoom.id,
    });

    if (!result.success) return;

    setMessage("");
  };

  return { message, setMessage, onSubmit };
};
