import type { MessagingSocket } from "../ports/MessagingSocket";
import { io } from "../../../socket";

export class SocketIOMessagingSocket implements MessagingSocket {
  async emitToRoom({
    roomId,
    event,
    payload,
  }: {
    roomId: string;
    event: string;
    payload: unknown;
  }): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    io.to(roomId).emit(event as any, payload as any);
  }
}
