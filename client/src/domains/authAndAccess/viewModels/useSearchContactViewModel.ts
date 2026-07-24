import { useState } from "react";
import { contactsControllers } from "@/composition";
import type { UserDTO } from "../entities/user";

export const useSearchContactViewModel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const search = async () => {
    setIsSearching(true);
    setError(null);

    const result = await contactsControllers.searchContact({ email: query });

    if (!result.success) {
      setError(result.message);
      setResults([]);
    } else {
      setResults([result.user]);
    }

    setIsSearching(false);
  };

  return { query, setQuery, results, error, isSearching, search };
};
