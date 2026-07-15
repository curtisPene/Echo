import clsx from "clsx";
import { useContacts } from "@/stores/useContacts";
import { ContactsListItem } from "./ContactsListItem";
import { useContactsList } from "../hooks/useContactsList";

export const ContactsList = () => {
  const { contacts } = useContacts();
  const { handler } = useContactsList();

  return (
    <div className={clsx("root", "flex w-full flex-col")}>
      <ul>
        {contacts.map((contact) => {
          const lastSeenAt = new Date().toISOString();
          return (
            <ContactsListItem
              key={contact.id}
              contact={contact}
              onClick={() => {
                handler(contact);
              }}
              lastSeenAt={lastSeenAt}
              online={true}
            />
          );
        })}
      </ul>
    </div>
  );
};
