import { httpClient } from "@/lib/httpClient";
import { parseOrThrow } from "@/lib/parseOrThrow";
import {
  createNewRoomAPIResponseSchema,
  acceptRoomInviteResponseSchema,
} from "../types";
import { Room } from "../entities/room";
import type { ServiceResult } from "@/types";
import type { RoomsApi, AcceptRoomInviteResult } from "../ports/RoomsApi";

export class HttpRoomsApi implements RoomsApi {
  async create({
    participants,
    name,
  }: {
    participants: { id: string }[];
    name: string;
  }): Promise<ServiceResult<Room>> {
    const response = await httpClient.post("/rooms/", { participants, name });
    const parsed = parseOrThrow(createNewRoomAPIResponseSchema, response.data);

    if (!parsed.success || !parsed.data) {
      return { success: false, message: parsed.message, data: null };
    }

    return {
      success: true,
      message: parsed.message,
      data: Room.hydrate(parsed.data),
    };
  }

  async acceptInvite({
    roomId,
    isAcceptRequest,
  }: {
    roomId: string;
    isAcceptRequest: boolean;
  }): Promise<ServiceResult<AcceptRoomInviteResult>> {
    const response = await httpClient.post("/rooms/accept-invite", {
      roomId,
      isAcceptRequest,
    });
    const parsed = parseOrThrow(acceptRoomInviteResponseSchema, response.data);

    if (!parsed.success || !parsed.data) {
      return { success: false, message: parsed.message, data: null };
    }

    return {
      success: true,
      message: parsed.message,
      data: parsed.data.roomDeleted
        ? { roomDeleted: true, roomId: parsed.data.roomId }
        : { roomDeleted: false, room: Room.hydrate(parsed.data.room) },
    };
  }
}
