import { socket } from "@/lib/socket";
import { messagingControllers } from "@/composition";
import { registerMessagingSocketHandlers } from "@/domains/messaging/socketHandlers/registerMessagingSocketHandlers";
import type { Auth } from "@/stores/useAuth";
import type { OnlineStatus } from "@/stores/useSocket";

export const connectRealtimeSocket = ({
  auth,
  setOnlineStatus,
}: {
  auth: Extract<Auth, { authStatus: "authenticated" }>;
  setOnlineStatus: (status: OnlineStatus) => void;
}) => {
  socket.auth = { id: auth.user.id, accessToken: auth.accessToken };

  const handleConnect = () => setOnlineStatus("online");
  const handleDisconnect = () => setOnlineStatus("offline");

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);

  const messagingSocketCleanup = registerMessagingSocketHandlers(
    socket,
    messagingControllers,
  );

  socket.on("auth:unauthorized", () => {
    // Todo: handle unauthorized
  });
  if (!socket.connected) socket.connect();

  return () => {
    socket.off("connect", handleConnect);
    messagingSocketCleanup();
    socket.off("disconnect", handleDisconnect);
  };
};
