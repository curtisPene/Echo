import { useState } from "react";
import { authControllers } from "@/composition";

export const useDeleteAccountViewModel = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openConfirm = () => setIsConfirming(true);
  const cancel = () => setIsConfirming(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await authControllers.deleteAccount();

    if (!result.success) {
      setError(result.message);
    }

    setIsDeleting(false);
    return result;
  };

  return { isConfirming, isDeleting, error, openConfirm, cancel, confirmDelete };
};
