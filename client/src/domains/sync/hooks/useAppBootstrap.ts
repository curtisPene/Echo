import type { Auth } from "@/stores/useAuth";
import type { AppStatus } from "@/stores/useAppStatus";
import { useEffect } from "react";
import type { OnlineStatus } from "@/stores/useSocket";
import { authControllers, syncControllers } from "@/composition";
import { connectRealtimeSocket } from "@/app/socket/connectRealtimeSocket";

export const useAppBootstrap = ({
  appStatus,
  auth,
  onlineStatus,
  setOnlineStatus,
}: {
  appStatus: AppStatus;
  auth: Auth;
  onlineStatus: OnlineStatus;
  setOnlineStatus: (isConnected: OnlineStatus) => void;
}) => {
  useEffect(() => {
    if (appStatus !== "idle" || auth.authStatus !== "unverified") return;
    authControllers.verify();
  }, [appStatus, auth]);

  useEffect(() => {
    if (appStatus !== "syncing" || auth.authStatus !== "authenticated") return;
    syncControllers.sync({ auth });
  }, [appStatus, auth]);

  useEffect(() => {
    if (appStatus !== "synced" || auth.authStatus !== "authenticated") return;

    const cleanupSocket = connectRealtimeSocket({ auth, setOnlineStatus });

    return () => {
      cleanupSocket();
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
