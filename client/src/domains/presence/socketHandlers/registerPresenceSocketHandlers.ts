import type { PresenceSocketControllers } from "../controllers/PresenceSocketControllers";
import type { Socket } from "@/lib/socket";

export const registerPresenceSocketHandlers = (
  socket: Socket,
  presenceControllers: PresenceSocketControllers,
) => {
  socket.on("user:online", presenceControllers.onUserOnline);
  socket.on("user:offline", presenceControllers.onUserOffline);

  return () => {
    socket.off("user:online", presenceControllers.onUserOnline);
    socket.off("user:offline", presenceControllers.onUserOffline);
  };
};
