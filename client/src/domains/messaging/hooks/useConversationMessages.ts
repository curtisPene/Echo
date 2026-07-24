import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { getRoomMessagesService } from "@/composition";
import type { MessageDTO } from "../entities/message";

export const useConversationMessages = () => {
  const activeRoom = useActiveRoom((state) => state.activeRoom);
  const [messages, setMessages] = useState<MessageDTO[]>([]);

  useEffect(() => {
    const query = getRoomMessagesService.execute({
      roomId: activeRoom?.id ?? null,
    });

    const subscription = liveQuery(query).subscribe({
      next: setMessages,
    });

    return () => subscription.unsubscribe();
  }, [activeRoom?.id]);

  return { activeRoom, messages };
};
