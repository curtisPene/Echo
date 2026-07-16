import mongoose from "mongoose";
import { RepoError } from "../../../errors/RepoError";
import { User } from "../../authAccess/mongooseModels/userModel";
import { Contacts } from "../models/contactsModel";

export type ContactsWithPopulatedUsers = Omit<Contacts, "contacts"> & {
  contacts: User[];
};

export type ContactsWithPopulatedUserAndContacts = Omit<
  Contacts,
  "user" | "contacts"
> & {
  user: User;
  contacts: User[];
};

export async function findContactsByUserId({
  userId,
  since,
}: {
  userId: string;
  since?: Date;
}): Promise<ContactsWithPopulatedUsers> {
  const contacts = await Contacts.findOne({
    user: userId,
    // ...(since ? { updatedAt: { $gt: since } } : {}),
  }).populate<{ contacts: User[] }>("contacts");

  if (!contacts) throw new RepoError("Contacts list for user not found");

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
}): Promise<ContactsWithPopulatedUsers> {
  const contacts = await Contacts.findOneAndUpdate(
    { user: userId },
    { $addToSet: { contacts: contactId } },
    { new: true },
  ).populate<{ contacts: User[] }>("contacts");

  if (!contacts) throw new RepoError("User created without a contacts object");

  return contacts.toJSON();
}

// Blocking is a two-sided write: the blocker's own blocked/contacts arrays,
// and the blocked user's contacts array (mutual-contact status can't survive
// a block). Both documents change together in one transaction.
export async function blockContact({
  userId,
  contactId,
}: {
  userId: string;
  contactId: string;
}): Promise<{
  blocker: ContactsWithPopulatedUsers;
  blocked: ContactsWithPopulatedUserAndContacts;
}> {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const blockerDoc = await Contacts.findOneAndUpdate(
        { user: userId },
        {
          $addToSet: { blocked: contactId },
          $pull: { contacts: contactId },
        },
        { new: true, session },
      ).populate<{ contacts: User[] }>("contacts");

      if (!blockerDoc)
        throw new RepoError("User created without a contacts object");

      const blockedDoc = await Contacts.findOneAndUpdate(
        { user: contactId },
        { $pull: { contacts: userId } },
        { new: true, session },
      ).populate<{ user: User; contacts: User[] }>(["user", "contacts"]);

      if (!blockedDoc)
        throw new RepoError("Blocked contact could not be found");

      return {
        blocker: blockerDoc.toJSON(),
        blocked: blockedDoc.toJSON(),
      };
    });
  } finally {
    await session.endSession();
  }
}
