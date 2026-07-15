import { roomsRepo } from "@/domains/conversation/repo/roomsRepo";
import type { Contact } from "@/domains/conversation/types";
import type { User } from "@/domains/auth & access/types";
import { roomsAPI } from "@/domains/conversation/api/roomsAPI";

export const createNewRoomService = async ({
  user,
  contacts,
}: {
  user: User;
  contacts: Contact[];
}) => {
  if (contacts.length === 1) {
    const rooms = await roomsRepo.getRooms();
    const contact = contacts[0];

    const existingOneOnOneRoom = rooms.find((room) => {
      const isOneOnOne = room.participants.length === 2;
      const hasContact = room.participants.some(
        (p) => p.user.id === contact.id,
      );

      return isOneOnOne && hasContact;
    });

    if (existingOneOnOneRoom) {
      return {
        roomId: existingOneOnOneRoom.id,
        name: existingOneOnOneRoom.name,
      };
    }
  }

  const name =
    contacts.length === 1
      ? `${user.firstName} & ${contacts[0].firstName}`
      : [user.firstName, ...contacts.map((c) => c.firstName)].join(", ");

  const result = await roomsAPI.createRoom({
    participants: contacts.map((contact) => ({ user: contact.id })),
    name,
  });

  if (!result.success || !result.data) return;

  await roomsRepo.createRoom({
    roomId: result.data.id,
    participants: result.data.participants,
    name: result.data.name,
  });

  return { roomId: result.data.id, name: result.data.name };
};
