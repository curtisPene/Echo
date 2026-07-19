import type { AuthAndAccessSocket } from "../ports/AuthAndAccessSocket";
import { io } from "../../../socket";

export class SocketIOAuthAndAccessSocket implements AuthAndAccessSocket {
  async joinRoom({ userId, roomId }: { userId: string; roomId: string }): Promise<void> {
    const sockets = await io.in(`user:${userId}`).fetchSockets();
    sockets.forEach((socket) => socket.join(roomId));
  }

  async leaveRoom({ userId, roomId }: { userId: string; roomId: string }): Promise<void> {
    const sockets = await io.in(`user:${userId}`).fetchSockets();
    sockets.forEach((socket) => socket.leave(roomId));
  }

  async emitToUser({
    userId,
    event,
    payload,
  }: {
    userId: string;
    event: string;
    payload: unknown;
  }): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    io.to(`user:${userId}`).emit(event as any, payload as any);
  }

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

  async disconnectUser({ userId }: { userId: string }): Promise<void> {
    const sockets = await io.in(`user:${userId}`).fetchSockets();
    sockets.forEach((socket) => socket.disconnect(true));
  }
}
