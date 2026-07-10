import { useContacts } from "@/stores/useContacts";
import { ContactsListItem } from "./ContactsListItem";

export const ContactsList = () => {
  const { contacts } = useContacts();
  console.log("Contacts: ", contacts);
  return (
    <ul>
      {contacts.map((contact) => {
        const lastSeenAt = new Date().toISOString();
        return (
          <ContactsListItem
            key={contact.id}
            contact={contact}
            onClick={() => {}}
            lastSeenAt={lastSeenAt}
            online={true}
          />
        );
      })}
    </ul>
  );
};
