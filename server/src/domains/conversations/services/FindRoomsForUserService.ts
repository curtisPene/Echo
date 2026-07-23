import { RoomDTO } from "../entities/room";
import { RoomRepository } from "../ports/RoomRepository";

export class FindRoomsForUserService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async execute({
    userId,
    since,
  }: {
    userId: string;
    since?: Date;
  }): Promise<RoomDTO[]> {
    const rooms = await this.roomRepo.findRoomsWithUserId({ userId, since });

    return rooms.map((room) => room.toDTO());
  }
}
