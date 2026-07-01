import type { Auth } from "@/stores/useAuth";
import type { AppStatus } from "@/stores/useAppStatus";
import { useEffect } from "react";
import { verifyRefreshTokenGateway } from "@/features/auth/gateway/authGateway";
import { appSyncGateway } from "../gateway/appGateway";
import { getAppContext, updateAppContext } from "../repo/appRepo";
import { syncRoomsRepo } from "@/features/rooms/repo/roomsRepo";
import { syncContactsRepo } from "@/features/contacts/repo/contactsRepo";
import { syncMessagesRepo } from "@/features/messaging/repo/messagesRepo";
import { socket } from "@/lib/socket";
import type { OnlineStatus } from "@/stores/useSocket";
import { onMessageRecieve } from "@/features/messaging/controllers/socketControllers";
import { onMessageRecieveSchema } from "@/features/messaging/types";

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
    const controller = new AbortController();

    const verificationController = async () => {
      const response = await verifyRefreshTokenGateway();

      if (controller.signal.aborted) return;
      console.log(response);
      if (!response.success || !response.data) {
        setAuth({ authStatus: "unauthenticated", user: null });
        return;
      }

      setAuth({
        authStatus: "authenticated",
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
      setAppStatus("syncing");
    };

    verificationController();

    return () => {
      controller.abort();
    };
  }, [appStatus, setAuth, setAppStatus, auth]);

  useEffect(() => {
    if (appStatus !== "syncing" || auth.authStatus !== "authenticated") return;

    const syncController = async () => {
      const context = await getAppContext(auth);

      if (!context) return;

      const syncResponse = await appSyncGateway({
        since: context.lastSync ?? undefined,
      });

      console.log(syncResponse);

      if (!syncResponse.success) return;

      const lastSync = syncResponse.data.lastSync;
      await updateAppContext({ user: auth.user, lastSync });
      await syncRoomsRepo({ rooms: syncResponse.data.rooms });
      await syncContactsRepo({ contacts: syncResponse.data.contacts });
      await syncMessagesRepo({ messages: syncResponse.data.messages });

      setAppStatus("synced");
    };

    syncController();
  }, [appStatus, auth, setAppStatus]);

  useEffect(() => {
    if (appStatus !== "synced" || auth.authStatus !== "authenticated") return;

    socket.auth = { id: auth.user.id, accessToken: auth.accessToken };

    const handleConnect = () => setOnlineStatus("online");
    const handleDisconnect = () => setOnlineStatus("offline");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("message:receive", (payload) => {
      const parsedPayload = onMessageRecieveSchema.parse(payload);
      if (!parsedPayload.success) return;
      onMessageRecieve({ message: parsedPayload.data.message });
    });

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message:receive");
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
