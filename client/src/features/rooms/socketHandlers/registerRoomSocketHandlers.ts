import { ZodError } from "zod";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { onRoomUpdatedPayloadSchema } from "../types";
import { updateRoomDB } from "../repo/roomsRepo";
import type { Socket } from "@/lib/socket";

export const registerRoomSocketHandlers = (socket: Socket) => {
  const roomUpdatedController = (payload: unknown) => {
    try {
      const parsed = parseOrReportError(onRoomUpdatedPayloadSchema, payload);
      updateRoomDB(parsed.room);
    } catch (error) {
      if (error instanceof ZodError) return;
      throw error;
    }
  };

  socket.on("room:updated", roomUpdatedController);

  return () => socket.off("room:updated", roomUpdatedController);
};
