import type { ServiceResult } from "@/types";
import type { RoomDTO } from "../entities/room";
import type { RoomsRepository } from "../ports/RoomsRepository";
import type { RoomsApi } from "../ports/RoomsApi";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class RenameRoomService {
  private readonly roomsApi: RoomsApi;
  private readonly roomsRepo: RoomsRepository;

  constructor(roomsApi: RoomsApi, roomsRepo: RoomsRepository) {
    this.roomsApi = roomsApi;
    this.roomsRepo = roomsRepo;
  }

  async execute({
    roomId,
    name,
  }: {
    roomId: string;
    name: string;
  }): Promise<ServiceResult<RoomDTO>> {
    try {
      const result = await this.roomsApi.rename({ roomId, name });

      if (!result.success || !result.data) {
        return { success: false, message: result.message, data: null };
      }

      await this.roomsRepo.update(result.data);

      return {
        success: true,
        message: "Room renamed successfully",
        data: result.data.toDTO(),
      };
    } catch (error) {
      if (
        error instanceof DomainError ||
        error instanceof RepoError ||
        error instanceof HttpError
      ) {
        return { success: false, message: error.message, data: null };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        data: null,
      };
    }
  }
}
