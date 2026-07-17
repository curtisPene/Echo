import { roomsRepo } from "@/domains/conversations/repo/roomsRepo";
import { Room } from "@/domains/conversations/domainModels/room";
import type { ContactDTO } from "@/domains/authAndAccess/domainModels/contacts";
import type { User } from "@/domains/authAndAccess/domainModels/user";
import { roomsAPI } from "@/domains/conversations/api/roomsAPI";
import type { ServiceResult } from "@/types";

export const createNewRoomService = async ({
  user,
  contacts,
}: {
  user: User;
  contacts: ContactDTO[];
}): Promise<ServiceResult<{ roomId: string; name: string }>> => {
  if (contacts.length === 1) {
    const rooms = await roomsRepo.getRooms();
    const contact = contacts[0];

    const existingOneOnOneRoom = rooms.find((dto) => {
      const room = Room.hydrate(dto);
      return room.isOneOnOne() && room.hasParticipant(contact.userId);
    });

    if (existingOneOnOneRoom) {
      return {
        success: true,
        message: "Room already exists",
        data: {
          roomId: existingOneOnOneRoom.id,
          name: existingOneOnOneRoom.name,
        },
      };
    }
  }

  const name =
    contacts.length === 1
      ? `${user.firstName} & ${contacts[0].firstName}`
      : [user.firstName, ...contacts.map((c) => c.firstName)].join(", ");

  const result = await roomsAPI.createRoom({
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

  await roomsRepo.createRoom({
    roomId: result.data.id,
    participants: result.data.participants,
    name: result.data.name,
  });

  return {
    success: true,
    message: "Room created successfully",
    data: { roomId: result.data.id, name: result.data.name },
  };
};
