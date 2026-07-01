import { socket } from "@/lib/socket";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { onMessageRecieveSchema } from "../types";

export const sendMessageGateway = async ({
  payload,
}: {
  payload: { message: string; roomId: string };
}) => {
  const { message, roomId } = payload;
  const response = await socket.emitWithAck("message:send", {
    message,
    roomId,
  });

  console.log(response);

  return parseOrReportError(onMessageRecieveSchema, response);
};
