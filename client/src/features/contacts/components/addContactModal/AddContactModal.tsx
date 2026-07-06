import { Button } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";
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
      <Modal
        ref={dialogRef}
        onClick={(e) => onDialogClick(e.target)}
        header={{
          title: "Add contact",
          description: "Add someone you know by email to connect",
        }}
      >
        <Form>
          <Input
            type="text"
            value={query}
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
        </Form>

        <div className={clsx(styles.searchResult)}>
          <UserFound searchResult={searchResult} onAddContact={addContact} />
        </div>
      </Modal>
    </>
  );
};
