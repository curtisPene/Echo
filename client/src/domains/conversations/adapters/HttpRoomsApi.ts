import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import {
  createNewRoomAPIResponseSchema,
  acceptRoomInviteResponseSchema,
} from "../types";
import type { RoomsApi } from "../ports/RoomsApi";

export class HttpRoomsApi implements RoomsApi {
  async create({
    participants,
    name,
  }: {
    participants: { user: string }[];
    name: string;
  }) {
    const response = await httpClient.post("/rooms/", { participants, name });
    return parseOrReportError(createNewRoomAPIResponseSchema, response.data);
  }

  async acceptInvite({ roomId }: { roomId: string }) {
    const response = await httpClient.post("/rooms/accept-invite", {
      roomId,
    });
    return parseOrReportError(acceptRoomInviteResponseSchema, response.data);
  }
}
