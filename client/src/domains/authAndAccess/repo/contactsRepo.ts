import type { Contact } from "@/domains/conversations/types";
import { db } from "@/infrastructure/sync/db";

export const contactsRepo = {
  async addContact(contact: Contact) {
    await db.contacts.add(contact);
  },

  async sync(contacts: Contact[]) {
    await db.contacts.bulkPut(contacts);
  },

  async getContacts() {
    return await db.contacts.toArray();
  },
};
