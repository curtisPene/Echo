import { useState } from "react";
import { contactsControllers } from "@/composition";
import type { ContactDTO } from "../entities/contacts";

export const useBlockContactViewModel = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openConfirm = () => setIsConfirming(true);
  const cancel = () => setIsConfirming(false);

  const confirmBlock = async (blockedContact: ContactDTO) => {
    setIsBlocking(true);
    setError(null);

    const result = await contactsControllers.blockContact({ blockedContact });

    if (!result.success) {
      setError(result.message);
    } else {
      setIsConfirming(false);
    }

    setIsBlocking(false);
    return result;
  };

  return { isConfirming, isBlocking, error, openConfirm, cancel, confirmBlock };
};
