import styles from "./ContactsHeader.module.css";
import clsx from "clsx";
import { AddContactModal } from "@/features/contacts/components/addContactModal/AddContactModal";

export const ContactsHeader = () => {
  return (
    <div className={clsx(styles.root, "contactsHeader")}>
      <span className={clsx(styles.title)}>Contacts</span>
      <AddContactModal />
    </div>
  );
};
