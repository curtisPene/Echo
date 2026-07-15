import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import {
  createNewRoomAPIResponseSchema,
  updateRoomParticipantResponseSchema,
} from "../types";

export const createNewRoomAPI = async ({
  participants,
  name,
}: {
  participants: { user: string }[];
  name: string;
}) => {
  const response = await httpClient.post("/rooms/", {
    participants,
    name,
  });

  return parseOrReportError(createNewRoomAPIResponseSchema, response.data);
};

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
