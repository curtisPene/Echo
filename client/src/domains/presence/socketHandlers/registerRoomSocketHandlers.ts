import { parseOrReportError } from "@/lib/parseOrReportError";
import { onRoomUpdatedPayloadSchema } from "../types";
import { roomsRepo } from "../../conversation/repo/roomsRepo";
import type { Socket } from "@/lib/socket";

const roomUpdatedController = (payload: unknown) => {
  const parsed = parseOrReportError(onRoomUpdatedPayloadSchema, payload);
  roomsRepo.updateRoom(parsed.room);
};

export const registerRoomSocketHandlers = (socket: Socket) => {
  socket.on("room:updated", roomUpdatedController);
  return () => socket.off("room:updated", roomUpdatedController);
};
