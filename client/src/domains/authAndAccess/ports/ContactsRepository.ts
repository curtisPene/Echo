import type { Contacts, ContactDTO, ContactsDTO } from "../entities/contacts";

export interface ContactsRepository {
  add(contact: ContactDTO): Promise<void>;
  sync(contactsDTO: ContactsDTO): Promise<void>;
  getContacts(): Promise<ContactDTO[]>;
  getBlocked(): Promise<ContactDTO[]>;
  getContactsAggregate(userId: string): Promise<Contacts>;
}
