import { Button } from "@/components/button/Button";
import { UserPlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "./AddContactModal.module.css";
import clsx from "clsx";
import { Form, Input } from "@/components/form/Form";
import { useAddContact } from "../hooks/useAddContact";
import { UserFound } from "./UserFound";

export const AddContactModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const { onSearch, userResult, isSearching, addContact } = useAddContact();

  const onSearchHandler = (email: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => onSearch(email), 500);
  };

  useEffect(() => {
    if (!ref.current) return;

    if (isOpen) ref.current.showModal();
    else ref.current.close();
  }, [isOpen]);

  return (
    <>
      <Button variant="icon" onClick={() => setIsOpen((isOpen) => !isOpen)}>
        <UserPlusIcon width={18} height={18} />
      </Button>
      <dialog
        className={clsx(styles.dialog)}
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) setIsOpen(false);
        }}
      >
        <div className={clsx(styles.inner)}>
          <div className={clsx(styles.dialogHeader)}>
            <span>Add contact</span>
            <span>Add someone you know by email to connect</span>
          </div>
          <Form>
            <Input
              type="text"
              onChange={(e) => onSearchHandler(e.target.value)}
            />
          </Form>

          <div className={clsx(styles.searchResult)}>
            <UserFound
              email={userResult?.data?.email}
              isSearching={isSearching}
              isSuccess={userResult?.success}
              onAddContact={addContact}
            />
          </div>
        </div>
      </dialog>
    </>
  );
};
