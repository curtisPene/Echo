import clsx from "clsx";
import { useContacts } from "@/stores/useContacts";
import { ContactsListItem } from "./ContactsListItem";
import { useContactsList } from "../hooks/useContactsList";

export const ContactsList = () => {
  const { contacts } = useContacts();
  const { handler } = useContactsList();

  return (
    <div className={clsx("root")}>
      <div
        className={clsx(
          "contactsListHeader",
          "border-border mb-3 block border-b px-1 pb-3 sm:hidden",
        )}
      >
        <h1 className="text-foreground text-xl font-semibold">Contacts</h1>
      </div>
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
