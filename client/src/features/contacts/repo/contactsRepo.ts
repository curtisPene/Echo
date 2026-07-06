import type { Contact } from "@/features/contacts/types";
import { db } from "@/lib/db";

export async function addContactRepo({ contact }: { contact: Contact }) {
  await db.contacts.add(contact);
}

export async function syncContactsRepo({ contacts }: { contacts: Contact[] }) {
  await db.contacts.bulkPut(contacts);
}
