import type { AddContactService } from "../services/AddContactService";
import { useAuth } from "@/stores/useAuth";
import type { ContactDTO } from "../domainModels/contacts";
import type { RoomDTO } from "@/domains/conversations/domainModels/room";

export type AddContactControllerResult =
  | { success: true; contact: ContactDTO; room: RoomDTO }
  | { success: false; message: string };

export class ContactsControllers {
  private readonly addContactService: AddContactService;

  constructor(addContactService: AddContactService) {
    this.addContactService = addContactService;
  }

  addContact = async ({
    contactId,
  }: {
    contactId: string;
  }): Promise<AddContactControllerResult> => {
    const auth = useAuth.getState();

    if (auth.authStatus !== "authenticated") {
      return { success: false, message: "Not authenticated" };
    }

    const result = await this.addContactService.execute({
      userId: auth.user.id,
      contactId,
    });

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      contact: result.data.addedUser,
      room: result.data.room,
    };
  };
}
