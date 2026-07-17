import { RoomDTO } from "../domainModels/room";
import { RoomRepo } from "../repo/mongooseRoomRepo";

export class FindRoomsForUserService {
  async execute({ userId, since }: { userId: string; since?: Date }): Promise<RoomDTO[]> {
    const rooms = await RoomRepo.findRoomsWithUserId({ userId, since });

    return rooms.map((room) => room.toDTO());
  }
}
