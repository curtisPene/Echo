import { parseOrReportError } from "@/lib/parseOrReportError";
import { onRoomUpdatedPayloadSchema } from "../types";
import { updateRoomDB } from "../repo/roomsRepo";
import type { Socket } from "@/lib/socket";

const roomUpdatedController = (payload: unknown) => {
  const parsed = parseOrReportError(onRoomUpdatedPayloadSchema, payload);
  updateRoomDB(parsed.room);
};

export const registerRoomSocketHandlers = (socket: Socket) => {
  socket.on("room:updated", roomUpdatedController);
  return () => socket.off("room:updated", roomUpdatedController);
};
