import type { ContactsApi } from "../ports/ContactsApi";
import type { ContactsRepository } from "../ports/ContactsRepository";
import type { RoomsRepository } from "@/domains/conversations/ports/RoomsRepository";
import type { ContactDTO } from "../entities/contacts";
import type { BlockedRoomResult } from "../types";
import { Room } from "@/domains/conversations/entities/room";
import type { ServiceResult } from "@/types";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class BlockContactService {
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
    blockedContact,
  }: {
    blockedContact: ContactDTO;
  }): Promise<ServiceResult<{ blockedContactId: string; updatedRooms: BlockedRoomResult[] }>> {
    try {
      const response = await this.contactsApi.block({
        blockedContactId: blockedContact.userId,
      });

      if (!response.success || !response.data) {
        return { success: false, message: response.message, data: null };
      }

      await this.contactsRepo.remove(blockedContact.userId);
      await this.contactsRepo.addBlocked(blockedContact);

      await Promise.all(
        response.data.updatedRooms.map((updatedRoom) =>
          "room" in updatedRoom
            ? this.roomsRepo.update(Room.hydrate(updatedRoom.room))
            : this.roomsRepo.deleteById(updatedRoom.roomId),
        ),
      );

      return {
        success: true,
        message: "Contact blocked successfully",
        data: response.data,
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
