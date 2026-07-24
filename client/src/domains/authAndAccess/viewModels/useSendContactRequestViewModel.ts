import { useState } from "react";
import { contactsControllers } from "@/composition";

export const useSendContactRequestViewModel = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendRequest = async (contactId: string) => {
    setIsSending(true);
    setError(null);

    const result = await contactsControllers.addContact({ contactId });

    if (!result.success) {
      setError(result.message);
    }

    setIsSending(false);
    return result;
  };

  return { error, isSending, sendRequest };
};
