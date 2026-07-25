import { useState } from "react";
import { roomsControllers } from "@/composition";

/**
 * Also the "leave room" flow for an already-accepted participant, not just
 * declining a still-pending invite - a room invite IS pending membership
 * (there's no separate invite record), so declining and leaving are the
 * same server operation regardless of the caller's own status. See
 * UpdateRoomInviteService's own comment on the server for the full
 * reasoning.
 */
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
