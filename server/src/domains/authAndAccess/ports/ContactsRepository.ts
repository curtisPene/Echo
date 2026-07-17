import { Contacts, NewContacts } from "../domainModels/contacts";

export interface ContactsRepository {
  findByUserId(params: { userId: string }): Promise<Contacts>;
  create(newContacts: NewContacts): Promise<Contacts>;
  update(contacts: Contacts): Promise<Contacts>;
  saveBlockPair(params: {
    blocker: Contacts;
    blocked: Contacts;
  }): Promise<{ blocker: Contacts; blocked: Contacts }>;
}
