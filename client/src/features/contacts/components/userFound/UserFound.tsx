import { Button } from "@/components/button/Button";
import clsx from "clsx";

import styles from "./UserFound.module.css";
import type { SearchResult } from "../../hooks/useAddContact";

export const UserFound = ({
  searchResult,
  onAddContact,
}: {
  searchResult: SearchResult;
  onAddContact: () => void;
}) => {
  return (
    <div className={clsx(styles.root)}>
      {searchResult.status === "idle" && null}
      {searchResult.status === "searching" && "Searching..."}
      {searchResult.status === "not_found" && "No results"}
      {searchResult.status === "found" && (
        <>
          <span className={clsx(styles.email)}>
            {searchResult.contact.email}
          </span>
          <Button onClick={onAddContact} variant="primary">
            Add
          </Button>
        </>
      )}
    </div>
  );
};
