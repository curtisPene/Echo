import { httpClient } from "@/lib/httpClient";
import { parseOrThrow } from "@/lib/parseOrThrow";
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
    participants: { id: string }[];
    name: string;
  }) {
    const response = await httpClient.post("/rooms/", { participants, name });
    return parseOrThrow(createNewRoomAPIResponseSchema, response.data);
  }

  async acceptInvite({ roomId }: { roomId: string }) {
    const response = await httpClient.post("/rooms/accept-invite", {
      roomId,
    });
    return parseOrThrow(acceptRoomInviteResponseSchema, response.data);
  }
}
