import mongoose, { HydratedDocument } from "mongoose";
import { RepoError } from "../../../errors/RepoError";
import { Contacts as ContactsMongooseModel } from "../mongooseModels/contactsModel";
import { createContacts as buildContacts, Contacts } from "../domainModels/authContacts";

function hydrateContacts(
  contactsDoc: HydratedDocument<ContactsMongooseModel>,
): Contacts {
  const raw = contactsDoc.toJSON();
  return buildContacts({
    id: raw.id.toString(),
    userId: raw.user.toString(),
    contactIds: raw.contacts.map((contactId) => contactId.toString()),
    blockedIds: raw.blocked.map((blockedId) => blockedId.toString()),
  });
}

export const contactsRepo = {
  async findContactsByUserId({
    userId,
    since,
  }: {
    userId: string;
    since?: Date;
  }): Promise<Contacts> {
    const contactsDoc = await ContactsMongooseModel.findOne({
      user: userId,
      // ...(since ? { updatedAt: { $gt: since } } : {}),
    });

    if (!contactsDoc) throw new RepoError("Contacts list for user not found");

    return hydrateContacts(contactsDoc);
  },

  async createContacts({ userId }: { userId: string }): Promise<Contacts> {
    const contactsDoc = await ContactsMongooseModel.create({ user: userId });
    return hydrateContacts(contactsDoc);
  },

  async addContact({
    userId,
    contactId,
  }: {
    userId: string;
    contactId: string;
  }): Promise<Contacts> {
    const contactsDoc = await ContactsMongooseModel.findOneAndUpdate(
      { user: userId },
      { $addToSet: { contacts: contactId } },
      { new: true },
    );

    if (!contactsDoc)
      throw new RepoError("User created without a contacts object");

    return hydrateContacts(contactsDoc);
  },

  // Blocking is a two-sided write: the blocker's own blocked/contacts arrays,
  // and the blocked user's contacts array (mutual-contact status can't survive
  // a block). Both documents change together in one transaction.
  async blockContact({
    userId,
    contactId,
  }: {
    userId: string;
    contactId: string;
  }): Promise<{ blocker: Contacts; blocked: Contacts }> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const blockerDoc = await ContactsMongooseModel.findOneAndUpdate(
          { user: userId },
          {
            $addToSet: { blocked: contactId },
            $pull: { contacts: contactId },
          },
          { new: true, session },
        );

        if (!blockerDoc)
          throw new RepoError("User created without a contacts object");

        const blockedDoc = await ContactsMongooseModel.findOneAndUpdate(
          { user: contactId },
          { $pull: { contacts: userId } },
          { new: true, session },
        );

        if (!blockedDoc)
          throw new RepoError("Blocked contact could not be found");

        return {
          blocker: hydrateContacts(blockerDoc),
          blocked: hydrateContacts(blockedDoc),
        };
      });
    } finally {
      await session.endSession();
    }
  },
};
