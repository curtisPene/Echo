import { Room, type RoomDTO } from "../entities/room";
import type { ServiceResult } from "@/types";
import type { RoomsRepository } from "../ports/RoomsRepository";
import type { RoomsApi } from "../ports/RoomsApi";

export class AcceptRequestService {
  private readonly roomsApi: RoomsApi;
  private readonly roomsRepo: RoomsRepository;

  constructor(roomsApi: RoomsApi, roomsRepo: RoomsRepository) {
    this.roomsApi = roomsApi;
    this.roomsRepo = roomsRepo;
  }

  async execute({ roomId }: { roomId: string }): Promise<ServiceResult<RoomDTO>> {
    // TODO: this should do a client-side pre-flight check via
    // Room.acceptParticipant(currentUserId) before calling the API, so the
    // client can only ever attempt to accept its own pending status - needs
    // a way to get the current user (db.appcontext / getAppContext() already
    // holds it, just needs a real service wrapping it). Also: the SERVER'S
    // own participant-status-mutating service currently trusts whatever
    // userId it's given without verifying it matches the acting/authed
    // user - that needs the equivalent fix server-side too.
    const response = await this.roomsApi.acceptInvite({ roomId });

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        data: null,
      };
    }

    await this.roomsRepo.update(Room.hydrate(response.data));

    return {
      success: true,
      message: "Request accepted successfully",
      data: response.data,
    };
  }
}
