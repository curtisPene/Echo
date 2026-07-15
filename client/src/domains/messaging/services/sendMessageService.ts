import type { ServiceResult } from "@/types";
import { sendMessageSocket } from "../api/messagingSocketAPI";
import { saveMessageDB } from "../repo/messagesRepo";
import { type Message } from "../types";

export const sendMessageService = async ({
  message,
  roomId,
}: {
  message: string;
  roomId: string;
}): Promise<ServiceResult<Message>> => {
  const response = await sendMessageSocket({
    payload: { message, roomId },
  });

  if (!response.success)
    return {
      success: false,
      message: response.message,
      data: null,
    };
  saveMessageDB({ message: response.data.message });

  return {
    success: true,
    message: "Message sent successfully",
    data: response.data.message,
  };
};
