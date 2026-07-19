import { Contacts, NewContacts } from "../domainModels/contacts";

export interface ContactsRepository {
  findByUserId(params: { userId: string }): Promise<Contacts>;
  create(newContacts: NewContacts): Promise<Contacts>;
  update(contacts: Contacts): Promise<Contacts>;
  saveBlockPair(params: {
    blocker: Contacts;
    blocked: Contacts;
  }): Promise<{ blocker: Contacts; blocked: Contacts }>;
  delete(params: { userId: string }): Promise<boolean>;
  removeUserFromAllLists(params: { userId: string }): Promise<void>;
}
