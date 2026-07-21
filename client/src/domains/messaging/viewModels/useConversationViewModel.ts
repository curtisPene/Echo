import { useEffect, useState, type FormEvent } from "react";
import { liveQuery } from "dexie";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { getRoomMessagesService, messagingControllers } from "@/composition";
import type { MessageDTO } from "../entities/message";

export const useConversationViewModel = () => {
  const activeRoom = useActiveRoom((state) => state.activeRoom);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = getRoomMessagesService.execute({
      roomId: activeRoom?.id ?? null,
    });

    const subscription = liveQuery(query).subscribe({
      next: setMessages,
    });

    return () => subscription.unsubscribe();
  }, [activeRoom?.id]);

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

  return {
    activeRoom,
    messages,
    message,
    setMessage,
    error,
    onSubmit,
  };
};
