import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { useAuth } from "@/stores/useAuth";
import { getConversationDetailsService } from "@/composition";
import type { RoomDTO } from "../entities/room";

export const useRoomDetails = () => {
  const activeRoom = useActiveRoom((state) => state.activeRoom);
  const currentUserId = useAuth((state) => state.user?.id);
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

  const currentParticipant = room?.participants.find(
    (p) => p.userId === currentUserId,
  );
  const isPendingForCurrentUser = currentParticipant?.status === "pending";

  return { room, isPendingForCurrentUser };
};
