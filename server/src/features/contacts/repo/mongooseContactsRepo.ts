import { User } from "../../users/models/userModel";
import { Contacts } from "../models/contactsModel";

export type ContactsWithPopulatedUsers = Omit<Contacts, "contacts"> & {
  contacts: User[];
};

export async function findContactsByUserId({
  userId,
  since,
}: {
  userId: string;
  since?: string;
}): Promise<ContactsWithPopulatedUsers> {
  const contacts = await Contacts.findOne({
    user: userId,
    // ...(since ? { updatedAt: { $gt: since } } : {}),
  }).populate<{ contacts: User[] }>("contacts");

  if (!contacts) throw new Error("Contacts list for user not found");

  return contacts.toJSON();
}

export async function createContacts({ userId }: { userId: string }) {
  const contacts = await Contacts.create({ user: userId });
  return contacts;
}

export async function addContact({
  userId,
  contactId,
}: {
  userId: string;
  contactId: string;
}) {
  const contacts = await Contacts.findOneAndUpdate(
    { user: userId },
    { $addToSet: { contacts: contactId } },
    { new: true },
  ).populate("contacts");

  if (!contacts) throw new Error("User created without a contacts object");

  return contacts.toJSON();
}
