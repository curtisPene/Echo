import { toPublicUser } from "../../users/models/userModel";
import { findUserById } from "../../users/repo/mongooseUserRepo";
import { findContactsByUserId } from "../repo/mongooseContactsRepo";

export async function addContactService({
  userId,
  contactId,
}: {
  userId: string;
  contactId: string;
}) {
  const addedUser = await findUserById({ id: contactId });
  const contactsList = await findContactsByUserId({ userId });

  if (!addedUser || !contactsList) return;

  contactsList?.contacts.push(addedUser._id);

  await contactsList.save();

  return toPublicUser(addedUser);
}
