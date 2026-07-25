import { useState } from "react";
import { roomsControllers } from "@/composition";

export const useRenameRoomViewModel = () => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameRoom = async (roomId: string, name: string) => {
    setIsRenaming(true);
    setError(null);

    const result = await roomsControllers.renameRoom({ roomId, name });

    if (!result.success) {
      setError(result.message);
    }

    setIsRenaming(false);
    return result;
  };

  return { isRenaming, error, renameRoom };
};
