import { createNewRoomDB, getRooms } from "@/features/rooms/repo/roomsRepo";
import type { Contact } from "../types";
import { createNewRoomAPI } from "@/features/rooms/gateway/roomsGateway";
import type { User } from "@/features/auth/types";

export const createNewRoomService = async ({
  user,
  contact,
}: {
  user: User;
  contact: Contact;
}) => {
  const rooms = await getRooms();

  const isInExistingOneOnOneRoom = rooms.filter((room) => {
    console.log("foo");
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
    participants: [contact.id],
    name: `${user.firstName} & ${contact.firstName}`,
  });

  if (!result.success || !result.data) return;

  await createNewRoomDB({
    id: result.data.id,
    participants: result.data.participants,
    name: result.data.name,
  });

  return { roomId: result.data.id, name: result.data.name };
};
