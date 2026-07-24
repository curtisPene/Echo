import { useState } from "react";
import { roomsControllers } from "@/composition";

export const useDeclineInviteViewModel = () => {
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const declineInvite = async (roomId: string) => {
    setIsDeclining(true);
    setError(null);

    const result = await roomsControllers.acceptRequest({
      roomId,
      isAcceptRequest: false,
    });

    if (!result.success) {
      setError(result.message);
    }

    setIsDeclining(false);
    return result;
  };

  return { isDeclining, error, declineInvite };
};
