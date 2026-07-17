import type { Room } from "@/domains/presence/types";
import type { ServiceResult } from "@/types";
import { roomsRepo } from "../repo/roomsRepo";
import { roomsAPI } from "../api/roomsAPI";

export const acceptRequestService = async ({
  roomId,
}: {
  roomId: string;
}): Promise<ServiceResult<Room>> => {
  const response = await roomsAPI.updateParticipant({
    roomId,
    status: "accepted",
  });

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
