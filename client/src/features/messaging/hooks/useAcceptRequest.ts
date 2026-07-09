import { updateRoomDB } from "@/features/rooms/repo/roomsRepo";
import { updateRoomParticipant } from "../api/messagingHttpAPI";

export const useAcceptRequest = async ({ roomId }: { roomId: string }) => {
  const response = await updateRoomParticipant({ roomId, status: "accepted" });

  if (!response.success) {
    console.log(response.message);
    return {
      success: false,
      message: response.message,
      data: null,
    };
  }

  await updateRoomDB(response.data);
};
