import { roomsRepo } from "../repo/roomsRepo";

export const getRoomsService = async () => {
  return await roomsRepo.getRooms();
};
