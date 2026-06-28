import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useAddContact } from "./useAddContact";

const SEARCH_DEBOUNCE_MS = 500;

export const useAddContactModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { onSearch, searchResult, clearSearch, addContact } = useAddContact();
  const debouncedSearch = useDebouncedCallback(onSearch, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (!dialogRef.current) return;

    if (isOpen) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
    clearSearch();
  };

  const toggleOpen = () => {
    if (isOpen) close();
    else setIsOpen(true);
  };

  const onDialogClick = (target: EventTarget) => {
    if (target === dialogRef.current) close();
  };

  const onSearchInputChange = (email: string) => {
    setQuery(email);
    debouncedSearch(email);
  };

  return {
    isOpen,
    dialogRef,
    toggleOpen,
    onDialogClick,
    query,
    onSearchInputChange,
    searchResult,
    addContact,
  };
};
