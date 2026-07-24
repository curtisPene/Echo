import type { ServiceResult } from "@/types";
import type { RoomsRepository } from "../ports/RoomsRepository";
import type { RoomsApi } from "../ports/RoomsApi";
import type { UpdateRoomInviteResult } from "../types";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class AcceptRequestService {
  private readonly roomsApi: RoomsApi;
  private readonly roomsRepo: RoomsRepository;

  constructor(roomsApi: RoomsApi, roomsRepo: RoomsRepository) {
    this.roomsApi = roomsApi;
    this.roomsRepo = roomsRepo;
  }

  async execute({
    roomId,
    isAcceptRequest,
  }: {
    roomId: string;
    isAcceptRequest: boolean;
  }): Promise<ServiceResult<UpdateRoomInviteResult>> {
    // TODO: this should do a client-side pre-flight check via
    // Room.acceptParticipant(currentUserId) before calling the API, so the
    // client can only ever attempt to accept its own pending status - needs
    // a way to get the current user (db.appcontext / getAppContext() already
    // holds it, just needs a real service wrapping it). Also: the SERVER'S
    // own participant-status-mutating service currently trusts whatever
    // userId it's given without verifying it matches the acting/authed
    // user - that needs the equivalent fix server-side too.
    try {
      const response = await this.roomsApi.acceptInvite({
        roomId,
        isAcceptRequest,
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message,
          data: null,
        };
      }

      if (response.data.roomDeleted) {
        await this.roomsRepo.deleteById(response.data.roomId);
      } else {
        await this.roomsRepo.update(response.data.room);
      }

      return {
        success: true,
        message: isAcceptRequest
          ? "Request accepted successfully"
          : "Request declined successfully",
        data: response.data.roomDeleted
          ? { roomDeleted: true, roomId: response.data.roomId }
          : { roomDeleted: false, room: response.data.room.toDTO() },
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
