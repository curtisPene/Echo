import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { getConversationDetailsService } from "@/composition";
import type { RoomDTO } from "../entities/room";

export const useConversationDetailsViewModel = () => {
  const activeRoom = useActiveRoom((state) => state.activeRoom);
  const [room, setRoom] = useState<RoomDTO | null>(null);

  useEffect(() => {
    const query = getConversationDetailsService.execute({
      activeRoomId: activeRoom?.id ?? null,
    });

    const subscription = liveQuery(query).subscribe({
      next: (fetchedRoom) => setRoom(fetchedRoom ? fetchedRoom.toDTO() : null),
    });

    return () => subscription.unsubscribe();
  }, [activeRoom?.id]);

  return { room };
};
