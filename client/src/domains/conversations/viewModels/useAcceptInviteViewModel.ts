import { useState } from "react";
import { roomsControllers } from "@/composition";

export const useAcceptInviteViewModel = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptInvite = async (roomId: string) => {
    setIsAccepting(true);
    setError(null);

    const result = await roomsControllers.acceptRequest({
      roomId,
      isAcceptRequest: true,
    });

    if (!result.success) {
      setError(result.message);
    }

    setIsAccepting(false);
    return result;
  };

  return { isAccepting, error, acceptInvite };
};
