import type { CreateNewRoomAPIResponse, AcceptRoomInviteResponse } from "../types";

export interface RoomsApi {
  create(params: {
    participants: { id: string }[];
    name: string;
  }): Promise<CreateNewRoomAPIResponse>;

  acceptInvite(params: {
    roomId: string;
    isAcceptRequest: boolean;
  }): Promise<AcceptRoomInviteResponse>;
}
