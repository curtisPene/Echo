import {
  createNewRoomDB,
  getRooms,
} from "@/domains/conversation/repo/repo/roomsRepo";
import type { Contact } from "../../contacts/types";
import { createNewRoomAPI } from "@/domains/presence/api/roomsAPI";
import type { User } from "@/domains/auth & access/types";

export const createNewRoomService = async ({
  user,
  contact,
}: {
  user: User;
  contact: Contact;
}) => {
  const rooms = await getRooms();

  const isInExistingOneOnOneRoom = rooms.filter((room) => {
    const isOneOnOne = room.participants.length === 2;
    const hasContact = room.participants.some((p) => p.user.id === contact.id);

    return isOneOnOne && hasContact;
  });

  if (isInExistingOneOnOneRoom.length > 0) {
    return {
      roomId: isInExistingOneOnOneRoom[0].id,
      name: isInExistingOneOnOneRoom[0].name,
    };
  }

  const result = await createNewRoomAPI({
    participants: [{ user: contact.id }],
    name: `${user.firstName} & ${contact.firstName}`,
  });

  if (!result.success || !result.data) return;

  await createNewRoomDB({
    roomId: result.data.id,
    participants: result.data.participants,
    name: result.data.name,
  });

  return { roomId: result.data.id, name: result.data.name };
};
