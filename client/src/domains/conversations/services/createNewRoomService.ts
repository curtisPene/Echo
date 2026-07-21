import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";
import type { User } from "@/domains/authAndAccess/entities/user";
import type { ServiceResult } from "@/types";
import type { RoomDTO } from "../entities/room";
import type { RoomsRepository } from "../ports/RoomsRepository";
import type { RoomsApi } from "../ports/RoomsApi";

export class CreateNewRoomService {
  private readonly roomsApi: RoomsApi;
  private readonly roomsRepo: RoomsRepository;

  constructor(roomsApi: RoomsApi, roomsRepo: RoomsRepository) {
    this.roomsApi = roomsApi;
    this.roomsRepo = roomsRepo;
  }

  async execute({
    user,
    contacts,
  }: {
    user: User;
    contacts: ContactDTO[];
  }): Promise<ServiceResult<RoomDTO>> {
    if (contacts.length === 1) {
      const rooms = await this.roomsRepo.getRooms();
      const contact = contacts[0];

      const existingOneOnOneRoom = rooms.find(
        (room) => room.isOneOnOne() && room.hasParticipant(contact.userId),
      );

      if (existingOneOnOneRoom) {
        return {
          success: true,
          message: "Room already exists",
          data: existingOneOnOneRoom.toDTO(),
        };
      }
    }

    const name =
      contacts.length === 1
        ? `${user.firstName} & ${contacts[0].firstName}`
        : [user.firstName, ...contacts.map((c) => c.firstName)].join(", ");

    const result = await this.roomsApi.create({
      participants: contacts.map((contact) => ({ user: contact.userId })),
      name,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
        data: null,
      };
    }

    await this.roomsRepo.create({
      roomId: result.data.id,
      participants: result.data.participants,
      name: result.data.name,
    });

    return {
      success: true,
      message: "Room created successfully",
      data: result.data,
    };
  }
}
