import { findContactsByUserId } from "../../contacts/repo/mongooseContactsRepo";
import { findRoomsWithUserId } from "../../rooms/repo/mongooseRoomRepo";

export async function syncUserDataService({
  userId,
  since,
}: {
  userId: string;
  since?: string;
}) {
  const rooms = await findRoomsWithUserId({ userId, since });
  const contacts = await findContactsByUserId({ userId: userId });

  return { rooms, contacts };
}
