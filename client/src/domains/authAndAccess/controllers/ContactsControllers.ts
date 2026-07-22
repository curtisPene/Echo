import type { AddContactService } from "../services/AddContactService";
import { useAuth } from "@/stores/useAuth";
import type { ContactDTO } from "../entities/contacts";
import type { RoomDTO } from "@/domains/conversations/entities/room";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

export type AddContactControllerResult =
  | { success: true; contact: ContactDTO; room: RoomDTO }
  | { success: false; message: string };

export class ContactsControllers {
  private readonly addContactService: AddContactService;
  private readonly notificationsPort: NotificationsPort;

  constructor(
    addContactService: AddContactService,
    notificationsPort: NotificationsPort,
  ) {
    this.addContactService = addContactService;
    this.notificationsPort = notificationsPort;
  }

  addContact = async ({
    contactId,
  }: {
    contactId: string;
  }): Promise<AddContactControllerResult> => {
    const auth = useAuth.getState();

    if (auth.authStatus !== "authenticated") {
      this.notificationsPort.notify("Not authenticated", "error");
      return { success: false, message: "Not authenticated" };
    }

    const result = await this.addContactService.execute({
      userId: auth.user.id,
      contactId,
    });

    if (!result.success || !result.data) {
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    return {
      success: true,
      contact: result.data.addedUser,
      room: result.data.room,
    };
  };
}
