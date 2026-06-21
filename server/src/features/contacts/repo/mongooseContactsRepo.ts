import { Contacts, contactsSchema } from "../models/contactsModel";

export async function findContactsByUserId({ userId }: { userId: string }) {
  const contacts = await Contacts.findOne({
    user: userId,
  });

  return contacts;
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
  );
  return contacts;
}
