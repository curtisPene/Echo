import { updateRoomDB } from "@/features/rooms/repo/roomsRepo";
import { updateRoomParticipant } from "../api/messagingHttpAPI";
import type { Room } from "@/features/rooms/types";
import type { ServiceResult } from "@/types";

export const acceptRequestService = async ({
  roomId,
}: {
  roomId: string;
}): Promise<ServiceResult<Room>> => {
  const response = await updateRoomParticipant({
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

  await updateRoomDB(response.data);

  return {
    success: true,
    message: "Request accepted successfully",
    data: response.data,
  };
};
