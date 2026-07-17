import type { RoomDTO } from "../types";
import type { ServiceResult } from "@/types";
import { roomsRepo } from "../repo/roomsRepo";
import { roomsAPI } from "../api/roomsAPI";

export const acceptRequestService = async ({
  roomId,
}: {
  roomId: string;
}): Promise<ServiceResult<RoomDTO>> => {
  const response = await roomsAPI.acceptInvite({ roomId });

  if (!response.success) {
    return {
      success: false,
      message: response.message,
      data: null,
    };
  }

  await roomsRepo.updateRoom(response.data);

  return {
    success: true,
    message: "Request accepted successfully",
    data: response.data,
  };
};
