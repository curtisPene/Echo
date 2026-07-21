import type { RoomsRepository } from "../ports/RoomsRepository";

export class GetRoomsService {
  private readonly roomsRepo: RoomsRepository;

  constructor(roomsRepo: RoomsRepository) {
    this.roomsRepo = roomsRepo;
  }

  async execute() {
    return await this.roomsRepo.getRooms();
  }
}
