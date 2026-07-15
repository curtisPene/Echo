import { useCallback } from "react";
import type { Contact } from "../types";
import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";
import { createNewRoomService } from "../../presence/services/createNewRoomService";

export const useContactsList = () => {
  const user = useAuth((state) => state.user);
  const setActiveRoom = useRooms((state) => state.setACtiveRoom);

  const startNewChat = useCallback(
    async (contact: Contact) => {
      if (!user) return;
      const serviceResult = await createNewRoomService({ user, contact });

      if (!serviceResult) return;

      const { roomId, name } = await serviceResult;
      setActiveRoom(roomId, name);
    },
    [user, setActiveRoom],
  );

  return { handler: startNewChat };
};
