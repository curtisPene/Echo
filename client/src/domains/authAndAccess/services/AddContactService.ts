import type { ContactsApi } from "../ports/ContactsApi";
import type { ContactsRepository } from "../ports/ContactsRepository";
import type { RoomsRepository } from "@/domains/conversations/ports/RoomsRepository";
import type { ContactDTO } from "../entities/contacts";
import type { RoomDTO } from "@/domains/conversations/entities/room";
import type { ServiceResult } from "@/types";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class AddContactService {
  private readonly contactsApi: ContactsApi;
  private readonly contactsRepo: ContactsRepository;
  private readonly roomsRepo: RoomsRepository;

  constructor(
    contactsApi: ContactsApi,
    contactsRepo: ContactsRepository,
    roomsRepo: RoomsRepository,
  ) {
    this.contactsApi = contactsApi;
    this.contactsRepo = contactsRepo;
    this.roomsRepo = roomsRepo;
  }

  async execute({
    userId,
    contactId,
  }: {
    userId: string;
    contactId: string;
  }): Promise<ServiceResult<{ addedUser: ContactDTO; room: RoomDTO }>> {
    try {
      const contacts = await this.contactsRepo.getContactsAggregate(userId);

      if (contacts.hasBlocked(contactId)) {
        return {
          success: false,
          message: "Contact already blocked",
          data: null,
        };
      }

      if (contacts.hasContact(contactId)) {
        return {
          success: false,
          message: "Contact already added",
          data: null,
        };
      }

      const response = await this.contactsApi.add({ contactId });

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message,
          data: null,
        };
      }

      await this.contactsRepo.add(response.data.addedUser);
      await this.roomsRepo.update(response.data.room);

      return {
        success: true,
        message: "Contact added successfully",
        data: {
          addedUser: response.data.addedUser,
          room: response.data.room.toDTO(),
        },
      };
    } catch (error) {
      if (
        error instanceof DomainError ||
        error instanceof RepoError ||
        error instanceof HttpError
      ) {
        return { success: false, message: error.message, data: null };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        data: null,
      };
    }
  }
}
