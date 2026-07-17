import { acceptRequestService } from "../services/acceptRequestService";

export type AcceptRequestControllerResult =
  | { success: true }
  | { success: false; message: string };

export const acceptRequestController = async ({
  roomId,
}: {
  roomId: string;
}): Promise<AcceptRequestControllerResult> => {
  const result = await acceptRequestService({ roomId });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true };
};
