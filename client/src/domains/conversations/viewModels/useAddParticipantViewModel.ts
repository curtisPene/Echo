import { useState } from "react";
import { roomsControllers } from "@/composition";

export const useAddParticipantViewModel = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = async (roomId: string, participantId: string) => {
    setIsAdding(true);
    setError(null);

    const result = await roomsControllers.addParticipant({
      roomId,
      participantId,
    });

    if (!result.success) {
      setError(result.message);
    }

    setIsAdding(false);
    return result;
  };

  return { isAdding, error, addParticipant };
};
