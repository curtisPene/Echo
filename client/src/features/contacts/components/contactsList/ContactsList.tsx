import clsx from "clsx";
import styles from "./ContactsList.module.css";
import { useContacts } from "@/stores/useContacts";
import { ContactsListItem } from "../contactsListItem/ContactsListItem";
import { ContactsHeader } from "../contactsHeader/ContactsHeader";
import { useContactsList } from "../../hooks/useContactsList";

export const ContactsList = () => {
  const { contacts } = useContacts();
  const { handler } = useContactsList();
  return (
    <div className={clsx(styles.root, "contactsList")}>
      <ContactsHeader />
      {contacts.map((contact) => (
        <ContactsListItem
          key={contact.id}
          contact={{ ...contact, online: true }}
          onClick={handler}
        />
      ))}
    </div>
  );
};
