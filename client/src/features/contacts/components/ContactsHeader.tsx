import styles from "./ContactsHeader.module.css";
import clsx from "clsx";
import { AddContactModal } from "./AddContactModal";

export const ContactsHeader = () => {
  return (
    <div className={clsx(styles.root, "contactsHeader")}>
      <span>Contacts</span>
      <AddContactModal />
    </div>
  );
};
