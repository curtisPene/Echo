import { Contacts, type ContactDTO, type ContactsDTO } from "../domainModels/contacts";
import { db } from "@/infrastructure/sync/db";
import type { ContactsRepository } from "../ports/ContactsRepository";

export class DexieContactsRepo implements ContactsRepository {
  async add(contact: ContactDTO) {
    await db.contacts.add(contact);
  }

  async sync(contactsDTO: ContactsDTO) {
    await db.contacts.bulkPut(contactsDTO.contacts);
    await db.blockedContacts.bulkPut(contactsDTO.blocked);
  }

  async getContacts(): Promise<ContactDTO[]> {
    return await db.contacts.toArray();
  }

  async getBlocked(): Promise<ContactDTO[]> {
    return await db.blockedContacts.toArray();
  }

  async getContactsAggregate(userId: string): Promise<Contacts> {
    const [contacts, blocked] = await Promise.all([
      db.contacts.toArray(),
      db.blockedContacts.toArray(),
    ]);

    return Contacts.hydrate({ id: userId, userId, contacts, blocked });
  }
}
