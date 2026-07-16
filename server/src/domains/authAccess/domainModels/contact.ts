import { User } from "./authUser";
import { Contacts } from "./contacts";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function toContact(contacts: Contacts, users: User[]): Contact[] {
  return users
    .filter((user) => contacts.contactIds.includes(user.id))
    .map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }));
}
