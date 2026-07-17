import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";
import { contactsRepo } from "../repo/ContactsRepo";
import { userRepo } from "../repo/UserRepo";

export async function addContactService({
  userId,
  contactId,
}: {
  userId: string;
  contactId: string;
}): Promise<
  ServiceResult<{
    addedUser: { userId: string; firstName: string; lastName: string; email: string };
  }>
> {
  try {
    const userContacts = await contactsRepo.findByUserId({ userId });

    // If the user has already blocked this contact return success false
    if (userContacts.hasBlocked(contactId))
      return { success: false, message: "Contact already blocked", data: null };

    // If the user has already added this contact return success false
    if (userContacts.hasContact(contactId))
      return { success: false, message: "Contact already added", data: null };

    const addedUser = await userRepo.findById({ id: contactId });

    if (!addedUser)
      return { success: false, message: "User not found", data: null };

    // Throws if contactId doesn't correspond to a real user (every user gets a Contacts doc at registration)
    const addedUserContacts = await contactsRepo.findByUserId({
      userId: contactId,
    });

    // If the contact has blocked the user return success false
    if (addedUserContacts.hasBlocked(userId))
      return {
        success: false,
        message: "Contact blocked the client",
        data: null,
      };

    // Add the contact to the user's contacts
    const updatedContacts = await contactsRepo.update(
      userContacts.addContact(addedUser),
    );

    const added = updatedContacts
      .toDTO()
      .contacts.find((contact) => contact.userId === contactId);

    if (!added)
      return { success: false, message: "Internal server error", data: null };

    // Return the added user
    return {
      success: true,
      message: "Contact added successfully",
      data: { addedUser: added },
    };
  } catch (error) {
    if (error instanceof RepoError) {
      console.error("[Repo]", error.message);
    } else {
      console.error(error);
    }
    return { success: false, message: "Internal server error", data: null };
  }
}
