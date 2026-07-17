import { Room } from "../domainModels/room";
import type { RoomDTO } from "../types";

export const hasPendingRequestsService = ({
  rooms,
  userId,
}: {
  rooms: RoomDTO[];
  userId: string | null;
}): boolean => {
  if (!userId) return false;
  return rooms.some((dto) => Room.hydrate(dto).isPendingFor(userId));
};
