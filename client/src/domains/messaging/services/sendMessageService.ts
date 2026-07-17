import type { ServiceResult } from "@/types";
import { sendMessageSocket } from "../api/messagingSocketAPI";
import { messagesRepo } from "../repo/messagesRepo";
import { type MessageDTO } from "../types";

export const sendMessageService = async ({
  message,
  roomId,
}: {
  message: string;
  roomId: string;
}): Promise<ServiceResult<MessageDTO>> => {
  const response = await sendMessageSocket({
    payload: { message, roomId },
  });

  if (!response.success)
    return {
      success: false,
      message: response.message,
      data: null,
    };
  messagesRepo.saveMessage(response.data.message);

  return {
    success: true,
    message: "Message sent successfully",
    data: response.data.message,
  };
};
