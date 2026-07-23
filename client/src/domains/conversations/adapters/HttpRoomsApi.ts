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

  async acceptInvite({
    roomId,
    isAcceptRequest,
  }: {
    roomId: string;
    isAcceptRequest: boolean;
  }) {
    const response = await httpClient.post("/rooms/accept-invite", {
      roomId,
      isAcceptRequest,
    });
    return parseOrThrow(acceptRoomInviteResponseSchema, response.data);
  }
}
