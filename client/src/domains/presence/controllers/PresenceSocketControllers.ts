import { presencePayloadSchema } from "../types";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { HttpError } from "@/errors/HttpError";
import { usePresence } from "../stores/usePresence";

export class PresenceSocketControllers {
  onUserOnline = (payload: unknown) => {
    let parsed;
    try {
      parsed = parseOrThrow(presencePayloadSchema, payload);
    } catch (error) {
      if (error instanceof HttpError) {
        console.error("Ignoring malformed user:online payload", error);
        return;
      }
      throw error;
    }

    usePresence.getState().setOnline(parsed.userId);
  };

  onUserOffline = (payload: unknown) => {
    let parsed;
    try {
      parsed = parseOrThrow(presencePayloadSchema, payload);
    } catch (error) {
      if (error instanceof HttpError) {
        console.error("Ignoring malformed user:offline payload", error);
        return;
      }
      throw error;
    }

    usePresence.getState().setOffline(parsed.userId);
  };
}
