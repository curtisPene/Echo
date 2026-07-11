import type { Auth } from "@/stores/useAuth";
import type { AppStatus } from "@/stores/useAppStatus";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import type { OnlineStatus } from "@/stores/useSocket";
import { syncService } from "../services/syncService";
import { verificaitonService } from "../services/verificationService";
import { registerMessagingSocketHandlers } from "@/features/messaging/socketHandlers/registerMessagingSocketHandlers";
import { registerRoomSocketHandlers } from "@/features/rooms/socketHandlers/registerRoomSocketHandlers";

export const useAppBootstrap = ({
  appStatus,
  auth,
  setAuth,
  setAppStatus,
  onlineStatus,
  setOnlineStatus,
}: {
  appStatus: AppStatus;
  auth: Auth;
  setAuth: (auth: Auth) => void;
  setAppStatus: (status: AppStatus) => void;
  onlineStatus: OnlineStatus;
  setOnlineStatus: (isConnected: OnlineStatus) => void;
}) => {
  useEffect(() => {
    if (appStatus !== "idle" || auth.authStatus !== "unverified") return;

    verificaitonService().then((result) => {
      if (!result.success || !result.data) {
        return setAuth({ authStatus: "unauthenticated", user: null });
      }
      setAuth({
        accessToken: result.data.accessToken,
        user: result.data.user,
        authStatus: "authenticated",
      });
      setAppStatus("syncing");
    });
  }, [appStatus, setAuth, setAppStatus, auth]);

  useEffect(() => {
    if (appStatus !== "syncing" || auth.authStatus !== "authenticated") return;

    syncService({ auth }).then((result) => {
      if (!result.success) {
        setAppStatus("syncFail");
      }
      setAppStatus("synced");
    });
  }, [appStatus, auth, setAppStatus]);

  useEffect(() => {
    if (appStatus !== "synced" || auth.authStatus !== "authenticated") return;

    socket.auth = { id: auth.user.id, accessToken: auth.accessToken };

    const handleConnect = () => setOnlineStatus("online");
    const handleDisconnect = () => setOnlineStatus("offline");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const messagingSocketCleanup = registerMessagingSocketHandlers(socket);
    const roomSocketCleanup = registerRoomSocketHandlers(socket);

    socket.on("auth:unauthorized", () => {
      // Todo: handle unauthorized
    });

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      messagingSocketCleanup();
      roomSocketCleanup();
      socket.off("disconnect", handleDisconnect);
    };
    // auth.user/accessToken are only read once authStatus === "authenticated",
    // which the guard above already checks - depending on the whole `auth`
    // object here would re-run this effect on every store update (it gets a
    // new reference each time), not just when auth actually transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appStatus, auth.authStatus, setOnlineStatus]);

  useEffect(() => {
    console.log("onlineStatus", onlineStatus);
  }, [onlineStatus]);
};
