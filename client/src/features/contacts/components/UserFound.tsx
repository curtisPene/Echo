import { Button } from "@/components/button/Button";
import clsx from "clsx";

import styles from "./UserFound.module.css";

export const UserFound = ({
  isSuccess,
  isSearching,
  email,
  onAddContact,
}: {
  isSuccess: boolean | undefined;
  isSearching: boolean;
  email: string | undefined;
  onAddContact: () => void;
}) => {
  return (
    <div className={clsx(styles.root)}>
      {isSuccess && !isSearching ? (
        <>
          <span className={clsx(styles.email)}>{email}</span>
          <Button onClick={onAddContact} variant="primary">
            Add
          </Button>
        </>
      ) : isSearching ? (
        "Searching..."
      ) : (
        "No results"
      )}
    </div>
  );
};
