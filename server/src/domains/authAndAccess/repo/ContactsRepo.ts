import mongoose from "mongoose";
import { RepoError } from "../../../errors/RepoError";
import { Contacts as ContactsDoc } from "../models/contactsModel";
import { Contacts, NewContacts } from "../domainModels/contacts";
import { ContactsRepository } from "../ports/ContactsRepository";
import { userRepo } from "./UserRepo";
import { AuthUser } from "../domainModels/authUser";

async function hydrateContacts(doc: {
  id: string;
  user: mongoose.Types.ObjectId;
  contacts: mongoose.Types.ObjectId[];
  blocked: mongoose.Types.ObjectId[];
}): Promise<Contacts> {
  const contactIds = doc.contacts.map((id) => id.toString());
  const blockedIds = doc.blocked.map((id) => id.toString());

  const users = await userRepo.findByIds([...contactIds, ...blockedIds]);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const resolve = (ids: string[]): AuthUser[] =>
    ids.map((id) => usersById.get(id)).filter((user): user is AuthUser => user !== undefined);

  return Contacts.hydrate({
    id: doc.id,
    userId: doc.user.toString(),
    contacts: resolve(contactIds),
    blocked: resolve(blockedIds),
  });
}

export class ContactsRepo implements ContactsRepository {
  async findByUserId({ userId }: { userId: string }): Promise<Contacts> {
    const doc = await ContactsDoc.findOne({ user: userId });

    if (!doc) throw new RepoError("Contacts list for user not found");

    return hydrateContacts(doc.toJSON());
  }

  async create(newContacts: NewContacts): Promise<Contacts> {
    const doc = await ContactsDoc.create({ user: newContacts.userId });

    return hydrateContacts(doc.toJSON());
  }

  /**
   * Persists a Contacts already mutated via its domain model methods -
   * this just writes whatever it's handed. All mutation decisions
   * (addContact, block, removeContact) happen in the Contacts domain
   * model before reaching this method.
   */
  async update(contacts: Contacts): Promise<Contacts> {
    const doc = await ContactsDoc.findOneAndUpdate(
      { user: contacts.userId },
      {
        $set: {
          contacts: contacts.getContactIds(),
          blocked: contacts.getBlockedIds(),
        },
      },
      { new: true },
    );

    if (!doc) throw new RepoError("Contacts list for user not found");

    return hydrateContacts(doc.toJSON());
  }

  /**
   * Blocking is a two-sided write: the blocker's own blocked/contacts
   * arrays, and the blocked user's contacts array (mutual-contact status
   * can't survive a block). Both documents change together in one
   * transaction. Callers pass in each side's already-decided Contacts
   * state (via Contacts.block / Contacts.removeContact).
   */
  async saveBlockPair({
    blocker,
    blocked,
  }: {
    blocker: Contacts;
    blocked: Contacts;
  }): Promise<{ blocker: Contacts; blocked: Contacts }> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const blockerDoc = await ContactsDoc.findOneAndUpdate(
          { user: blocker.userId },
          {
            $set: {
              contacts: blocker.getContactIds(),
              blocked: blocker.getBlockedIds(),
            },
          },
          { new: true, session },
        );

        if (!blockerDoc)
          throw new RepoError("Contacts list for user not found");

        const blockedDoc = await ContactsDoc.findOneAndUpdate(
          { user: blocked.userId },
          { $set: { contacts: blocked.getContactIds() } },
          { new: true, session },
        );

        if (!blockedDoc)
          throw new RepoError("Contacts list for user not found");

        return {
          blocker: await hydrateContacts(blockerDoc.toJSON()),
          blocked: await hydrateContacts(blockedDoc.toJSON()),
        };
      });
    } finally {
      await session.endSession();
    }
  }

  async delete({ userId }: { userId: string }): Promise<boolean> {
    const result = await ContactsDoc.deleteOne({ user: userId });

    return result.deletedCount > 0;
  }

  /**
   * Strips a deleted user out of every other user's contacts/blocked lists -
   * the multi-party counterpart to saveBlockPair, which only ever updates
   * one blocker/blocked pair at a time.
   */
  async removeUserFromAllLists({ userId }: { userId: string }): Promise<void> {
    await ContactsDoc.updateMany(
      { $or: [{ contacts: userId }, { blocked: userId }] },
      { $pull: { contacts: userId, blocked: userId } },
    );
  }
}

export const contactsRepo = new ContactsRepo();
