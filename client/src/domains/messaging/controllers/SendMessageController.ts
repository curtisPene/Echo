import { sendMessageService } from "../services/sendMessageService";

export type SendMessageControllerResult =
  | { success: true }
  | { success: false; message: string };

export const sendMessageController = async ({
  message,
  roomId,
}: {
  message: string;
  roomId: string;
}): Promise<SendMessageControllerResult> => {
  const result = await sendMessageService({ message, roomId });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true };
};
