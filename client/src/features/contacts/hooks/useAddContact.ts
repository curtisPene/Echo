import { useCallback, useState } from "react";
import { addContactAPI, searchContactAPI } from "../api/contactsAPI";
import type { Contact } from "../types";
import { addContactRepo } from "../repo/contactsRepo";

export type SearchResult =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; contact: Contact }
  | { status: "not_found" };

export const useAddContact = () => {
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

    const response = await addContactAPI({
      contactId: searchResult.contact.id,
    });

    if (!response.success) return;

    addContactRepo({ contact: response.data });
  };

  return {
    setSearchResult,
    clearSearch,
    searchResult,
    onSearch,
    addContact,
  };
};
