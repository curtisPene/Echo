import { useCallback, useState } from "react";
import { searchContactAPI } from "../api/contactsHttpAPI";
import type { Contact } from "../types";
import { addContactService } from "../services/addContactService";

export type SearchResult =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; contact: Contact }
  | { status: "not_found" };

export const useAddContact = (onContactAdded: () => void) => {
  const [searchResult, setSearchResult] = useState<SearchResult>({
    status: "idle",
  });

  const onSearch = useCallback(async (email: string) => {
    setSearchResult({ status: "searching" });
    const response = await searchContactAPI(email);
    setSearchResult(
      response.success && response.data
        ? { status: "found", contact: response.data }
        : { status: "not_found" },
    );
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResult({ status: "idle" });
  }, []);

  const addContact = async () => {
    if (searchResult.status !== "found") return;

    const serviceResult = await addContactService({
      contactId: searchResult.contact.id,
    });

    if (!serviceResult.success) return;

    onContactAdded();
  };

  return {
    setSearchResult,
    clearSearch,
    searchResult,
    onSearch,
    addContact,
  };
};
