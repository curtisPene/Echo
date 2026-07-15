import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { updateRoomParticipantResponseSchema } from "../types";

export const updateRoomParticipant = async ({
  status,
  roomId,
  lastReadAt,
}: {
  status: "pending" | "accepted";
  lastReadAt?: string;
  roomId: string;
}) => {
  const response = await httpClient.post("/rooms/update-participant", {
    roomId,
    status,
    lastReadAt,
  });

  return parseOrReportError(updateRoomParticipantResponseSchema, response.data);
};
