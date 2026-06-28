import { Button } from "@/components/button/Button";
import { UserPlusIcon } from "lucide-react";

import styles from "./AddContactModal.module.css";
import clsx from "clsx";
import { Form, Input } from "@/components/form/Form";
import { useAddContactModal } from "../../hooks/useAddContactModal";
import { UserFound } from "../userFound/UserFound";

export const AddContactModal = () => {
  const {
    dialogRef,
    toggleOpen,
    onDialogClick,
    query,
    onSearchInputChange,
    searchResult,
    addContact,
  } = useAddContactModal();

  return (
    <>
      <Button variant="icon" onClick={toggleOpen}>
        <UserPlusIcon width={18} height={18} />
      </Button>
      <dialog
        className={clsx(styles.dialog)}
        ref={dialogRef}
        onClick={(e) => onDialogClick(e.target)}
      >
        <div className={clsx(styles.inner)}>
          <div className={clsx(styles.dialogHeader)}>
            <span>Add contact</span>
            <span>Add someone you know by email to connect</span>
          </div>
          <Form>
            <Input
              type="text"
              value={query}
              onChange={(e) => onSearchInputChange(e.target.value)}
            />
          </Form>

          <div className={clsx(styles.searchResult)}>
            <UserFound
              searchResult={searchResult}
              onAddContact={addContact}
            />
          </div>
        </div>
      </dialog>
    </>
  );
};
