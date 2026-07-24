import { useState } from "react";
import { roomsControllers } from "@/composition";
import { useAuth } from "@/stores/useAuth";
import type { RoomDTO } from "../entities/room";
import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";

export const useStartConversationViewModel = () => {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async (entry: { room?: RoomDTO; contact: ContactDTO }) => {
    if (entry.room) {
      roomsControllers.selectRoom(entry.room);
      return { success: true as const };
    }

    const currentUser = useAuth.getState().user;
    if (!currentUser) {
      const message = "Not authenticated";
      setError(message);
      return { success: false as const, message };
    }

    setIsOpening(true);
    setError(null);

    const result = await roomsControllers.createRoom({
      user: currentUser,
      contacts: [entry.contact],
    });

    if (!result.success) {
      setError(result.message);
    }

    setIsOpening(false);
    return result;
  };

  return { isOpening, error, open };
};
