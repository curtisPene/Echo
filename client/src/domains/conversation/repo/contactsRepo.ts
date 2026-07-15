import type { Contact } from "@/domains/contacts/types";
import { db } from "@/infrastructure/sync/db";

export async function addContactRepo({ contact }: { contact: Contact }) {
  await db.contacts.add(contact);
}

export async function syncContactsRepo({ contacts }: { contacts: Contact[] }) {
  await db.contacts.bulkPut(contacts);
}
