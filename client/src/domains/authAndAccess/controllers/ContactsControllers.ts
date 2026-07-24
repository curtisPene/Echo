import type { AddContactService } from "../services/AddContactService";
import type { SearchContactService } from "../services/SearchContactService";
import type { BlockContactService } from "../services/BlockContactService";
import { useAuth } from "@/stores/useAuth";
import type { UserDTO } from "../entities/user";
import type { ContactDTO } from "../entities/contacts";
import type { RoomDTO } from "@/domains/conversations/entities/room";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

export type AddContactControllerResult =
  | { success: true; contact: ContactDTO; room: RoomDTO }
  | { success: false; message: string };

export type SearchContactControllerResult =
  | { success: true; user: UserDTO }
  | { success: false; message: string };

export type BlockContactControllerResult =
  | { success: true; blockedContactId: string }
  | { success: false; message: string };

export class ContactsControllers {
  private readonly addContactService: AddContactService;
  private readonly searchContactService: SearchContactService;
  private readonly blockContactService: BlockContactService;
  private readonly notificationsPort: NotificationsPort;

  constructor(
    addContactService: AddContactService,
    searchContactService: SearchContactService,
    blockContactService: BlockContactService,
    notificationsPort: NotificationsPort,
  ) {
    this.addContactService = addContactService;
    this.searchContactService = searchContactService;
    this.blockContactService = blockContactService;
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

  searchContact = async ({
    email,
  }: {
    email: string;
  }): Promise<SearchContactControllerResult> => {
    const result = await this.searchContactService.execute({ email });

    if (!result.success || !result.data) {
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    const { id, firstName, lastName, email: userEmail } = result.data;

    return {
      success: true,
      user: { id, firstName, lastName, email: userEmail },
    };
  };

  blockContact = async ({
    blockedContact,
  }: {
    blockedContact: ContactDTO;
  }): Promise<BlockContactControllerResult> => {
    const auth = useAuth.getState();

    if (auth.authStatus !== "authenticated") {
      this.notificationsPort.notify("Not authenticated", "error");
      return { success: false, message: "Not authenticated" };
    }

    const result = await this.blockContactService.execute({ blockedContact });

    if (!result.success || !result.data) {
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    return { success: true, blockedContactId: result.data.blockedContactId };
  };
}
