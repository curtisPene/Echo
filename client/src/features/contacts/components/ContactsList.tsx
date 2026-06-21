import clsx from "clsx";
import styles from "./ContactsList.module.css";
import { useContacts } from "@/stores/useContacts";
import { ContactsListItem } from "./ContactsListItem";

export const ContactsList = () => {
  const { contacts } = useContacts();
  return (
    <div className={clsx(styles.root, "contactsList")}>
      {contacts.map((contact) => (
        <ContactsListItem
          key={contact.id}
          contact={{ ...contact, online: true }}
        />
      ))}
    </div>
  );
};
