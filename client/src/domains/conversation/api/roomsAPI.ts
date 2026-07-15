import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import {
  createNewRoomAPIResponseSchema,
  updateRoomParticipantResponseSchema,
} from "../../presence/types";

export const roomsAPI = {
  async createRoom({
    participants,
    name,
  }: {
    participants: { user: string }[];
    name: string;
  }) {
    const response = await httpClient.post("/rooms/", { participants, name });
    return parseOrReportError(createNewRoomAPIResponseSchema, response.data);
  },

  async updateParticipant({
    status,
    roomId,
    lastReadAt,
  }: {
    status: "pending" | "accepted";
    lastReadAt?: string;
    roomId: string;
  }) {
    const response = await httpClient.post("/rooms/update-participant", {
      roomId,
      status,
      lastReadAt,
    });
    return parseOrReportError(
      updateRoomParticipantResponseSchema,
      response.data,
    );
  },
};
