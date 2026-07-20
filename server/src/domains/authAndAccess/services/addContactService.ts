import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";
import type { ContactsRepository } from "../ports/ContactsRepository";
import type { UserRepository } from "../ports/UserRepository";
import type { AuthAndAccessSocket } from "../ports/AuthAndAccessSocket";
import { CreateNewRoomService } from "../../conversations/services/createNewRoomService";
import { RoomDTO } from "../../conversations/domainModels/room";
import { Identity } from "../domainModels/identity";

export class AddContactService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly contactsRepo: ContactsRepository,
    private readonly socket: AuthAndAccessSocket,
    private readonly createNewRoomService: CreateNewRoomService,
  ) {}

  async execute({
    userId,
    contactId,
  }: {
    userId: string;
    contactId: string;
  }): Promise<
    ServiceResult<{
      addedUser: { userId: string; firstName: string; lastName: string; email: string };
      room: RoomDTO;
    }>
  > {
    try {
      const userContacts = await this.contactsRepo.findByUserId({ userId });

      // If the user has already blocked this contact return success false
      if (userContacts.hasBlocked(contactId))
        return { success: false, message: "Contact already blocked", data: null };

      // If the user has already added this contact return success false
      if (userContacts.hasContact(contactId))
        return { success: false, message: "Contact already added", data: null };

      const adder = await this.userRepo.findById({ id: userId });

      if (!adder)
        return { success: false, message: "Internal server error", data: null };

      const addedUser = await this.userRepo.findById({ id: contactId });

      if (!addedUser)
        return { success: false, message: "User not found", data: null };

      // Throws if contactId doesn't correspond to a real user (every user gets a Contacts doc at registration)
      const addedUserContacts = await this.contactsRepo.findByUserId({
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
      const updatedContacts = await this.contactsRepo.update(
        userContacts.addContact(addedUser),
      );

      const added = updatedContacts
        .toDTO()
        .contacts.find((contact) => contact.userId === contactId);

      if (!added)
        return { success: false, message: "Internal server error", data: null };

      // Adding a contact creates the 1:1 room immediately - the adder is
      // auto-accepted (Room.create's existing creator/participant split),
      // the added contact starts pending. This IS the "contact request":
      // there's no separate request/pending entity, the pending room is it.
      const roomResult = await this.createNewRoomService.execute({
        user: Identity.hydrate(adder).toDTO(),
        participants: [{ id: contactId }],
        name: `${adder.firstName}, ${addedUser.firstName}`,
      });

      if (!roomResult.success || !roomResult.data)
        return { success: false, message: "Internal server error", data: null };

      // The adder's own already-connected sockets need to join the new room
      // live - otherwise they can't send into it until their next reconnect
      // (addUserToRoomsService only runs once, at connect time).
      await this.socket.joinRoom({ userId, roomId: roomResult.data.id });

      // If the added contact is currently online, push the new pending
      // room to their client live too, and join their sockets so they can
      // read (though not yet send/accept) without needing to reconnect.
      await this.socket.joinRoom({ userId: contactId, roomId: roomResult.data.id });
      await this.socket.emitToUser({
        userId: contactId,
        event: "room:updated",
        payload: { room: roomResult.data },
      });

      // Return the added user
      return {
        success: true,
        message: "Contact added successfully",
        data: { addedUser: added, room: roomResult.data },
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
}
