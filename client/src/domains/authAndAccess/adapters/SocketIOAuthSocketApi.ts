import { socket } from "@/lib/socket";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { logoutResponseSchema } from "../types";
import type { ServiceResult } from "@/types";
import type { AuthSocketApi } from "../ports/AuthSocketApi";

export class SocketIOAuthSocketApi implements AuthSocketApi {
  async logout(): Promise<ServiceResult<null>> {
    const response = await socket.emitWithAck("auth:logout");
    return parseOrThrow(logoutResponseSchema, response);
  }
}
