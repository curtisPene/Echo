import { sendMessageService } from "../services/sendMessageService";

export type SendMessageControllerResult =
  | { success: true }
  | { success: false; message: string };

export const sendMessageController = async ({
  text,
  roomId,
}: {
  text: string;
  roomId: string;
}): Promise<SendMessageControllerResult> => {
  const result = await sendMessageService({ text, roomId });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true };
};
