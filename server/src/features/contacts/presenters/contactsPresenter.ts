import { User } from "../../users/models/userModel";
import { ContactsWithPopulatedUsers } from "../repo/mongooseContactsRepo";

export const contactPresenter = (contact: User) => {
  return {
    id: contact._id.toString(),
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
  };
};

export type ContactView = ReturnType<typeof contactPresenter>;

export const contactsPresenter = ({
  contacts,
}: {
  contacts: ContactsWithPopulatedUsers;
}) => {
  return contacts.contacts.map(contactPresenter);
};
