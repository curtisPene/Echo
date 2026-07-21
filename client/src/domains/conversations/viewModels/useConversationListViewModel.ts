import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { useAuth } from "@/stores/useAuth";
import { getRoomsService, roomsControllers } from "@/composition";
import type { RoomDTO } from "../entities/room";

export const useConversationListViewModel = () => {
  const currentUserId = useAuth((state) => state.user?.id);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [pendingRooms, setPendingRooms] = useState<RoomDTO[]>([]);

  useEffect(() => {
    const subscription = liveQuery(() => getRoomsService.execute()).subscribe({
      next: (fetchedRooms) => {
        const accepted: RoomDTO[] = [];
        const pending: RoomDTO[] = [];

        for (const room of fetchedRooms) {
          const dto = room.toDTO();
          if (room.statusFor(currentUserId ?? "") === "accepted") {
            accepted.push(dto);
          } else {
            pending.push(dto);
          }
        }

        setRooms(accepted);
        setPendingRooms(pending);
      },
    });

    return () => subscription.unsubscribe();
  }, [currentUserId]);

  return {
    rooms,
    pendingRooms,
    hasPendingRequests: pendingRooms.length > 0,
    selectRoom: roomsControllers.selectRoom,
    clearActiveRoom: roomsControllers.clearActiveRoom,
  };
};
