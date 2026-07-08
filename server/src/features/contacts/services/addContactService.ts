import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";
import { User } from "../../users/models/userModel";
import { addContact, findContactsByUserId } from "../repo/mongooseContactsRepo";

export async function addContactService({
  userId,
  contactId,
}: {
  userId: string;
  contactId: string;
}): Promise<ServiceResult<{ addedUser: User }>> {
  try {
    const userContactsDoc = await findContactsByUserId({ userId });

    // If the user has already blocked this contact return success false
    if (userContactsDoc.blocked.some((id) => id.toString() === contactId))
      return { success: false, message: "Contact already blocked", data: null };

    // If the user has already added this contact return success false
    if (userContactsDoc.contacts.some((id) => id.toString() === contactId))
      return { success: false, message: "Contact already added", data: null };

    // Throws if contactId doesn't correspond to a real user (every user gets a Contacts doc at registration)
    const addedUserContactsDoc = await findContactsByUserId({
      userId: contactId,
    });

    // If the contact has blocked the user return success false
    if (addedUserContactsDoc.blocked.some((id) => id.toString() === userId))
      return {
        success: false,
        message: "Contact blocked the client",
        data: null,
      };

    // Add the contact to the users contacts document
    const contactsDoc = await addContact({ userId, contactId });

    const addedUser = contactsDoc.contacts.find(
      (user) => user._id.toString() === contactId,
    );
    if (!addedUser)
      return { success: false, message: "Internal server error", data: null };

    // Return the added user
    return {
      success: true,
      message: "Contact added successfully",
      data: {
        addedUser,
      },
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
