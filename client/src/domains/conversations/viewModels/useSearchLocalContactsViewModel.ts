import { useState } from "react";
import { contactsControllers } from "@/composition";
import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";

export const useSearchLocalContactsViewModel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContactDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const search = async () => {
    setIsSearching(true);
    setError(null);

    const result = await contactsControllers.searchLocalContacts({
      email: query,
    });

    if (!result.success) {
      setError(result.message);
      setResults([]);
    } else {
      setResults([result.contact]);
    }

    setIsSearching(false);
  };

  return { query, setQuery, results, error, isSearching, search };
};
