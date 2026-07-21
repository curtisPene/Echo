import type { CreateNewRoomAPIResponse, AcceptRoomInviteResponse } from "../types";

export interface RoomsApi {
  create(params: {
    participants: { user: string }[];
    name: string;
  }): Promise<CreateNewRoomAPIResponse>;

  acceptInvite(params: { roomId: string }): Promise<AcceptRoomInviteResponse>;
}
