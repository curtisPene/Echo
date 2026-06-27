import { Contacts } from "../models/contactsModel";
import { ContactsWithPopulatedUsers } from "../repo/mongooseContactsRepo";

export const contactsPresenter = ({
  contacts,
}: {
  contacts: ContactsWithPopulatedUsers;
}) => {
  const userList = contacts.contacts.map((user) => {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  });

  return userList;
};
