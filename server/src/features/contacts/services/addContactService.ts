import { toPublicUser } from "../../users/presenters/usersPresenter";
import { findUserById } from "../../users/repo/mongooseUserRepo";
import { addContact } from "../repo/mongooseContactsRepo";

export async function addContactService({
  userId,
  contactId,
}: {
  userId: string;
  contactId: string;
}) {
  const addedUser = await findUserById({ id: contactId });
  if (!addedUser) return;

  const contactsDoc = await addContact({ userId, contactId });

  if (!contactsDoc) return;

  return toPublicUser(addedUser);
}
