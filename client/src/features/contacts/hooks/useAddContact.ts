import { useCallback, useState } from "react";
import {
  addContactGateway,
  searchContactGateway,
} from "../gateway/contactsGateway";
import type { Contact } from "../types";
import { addContactRepo } from "../repo/contactsRepo";

export const useAddContact = () => {
  const [userResult, setUserResult] = useState<{
    success: boolean;
    data: Contact | null;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const onSearch = useCallback(async (email: string) => {
    setIsSearching(true);
    const response = await searchContactGateway(email);
    setTimeout(() => {
      setUserResult({ success: response.success, data: response.data });
      setIsSearching(false);
    }, 800);
  }, []);

  const addContact = async () => {
    if (!userResult?.success || !userResult.data) return;
    const { id } = userResult.data;

    const response = await addContactGateway({
      contactId: id,
    });

    if (!response.success) return;

    addContactRepo({ contact: response.data });
  };

  return {
    userResult,
    onSearch,
    addContact,
    isSearching,
  };
};
