import type { ServiceResult } from "@/types";
import type { Room } from "../entities/room";

export type AcceptRoomInviteResult =
  | { roomDeleted: true; roomId: string }
  | { roomDeleted: false; room: Room };

export interface RoomsApi {
  create(params: {
    participants: { id: string }[];
    name: string;
  }): Promise<ServiceResult<Room>>;

  acceptInvite(params: {
    roomId: string;
    isAcceptRequest: boolean;
  }): Promise<ServiceResult<AcceptRoomInviteResult>>;
}
