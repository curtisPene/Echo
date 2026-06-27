import type { Auth } from "@/stores/useAuth";
import type { AppStatus } from "@/stores/useAppStatus";
import { useEffect } from "react";
import { verifyRefreshTokenGateway } from "@/features/auth/gateway/authGateway";
import { appSyncGateway } from "../gateway/appGateway";
import { getAppContext, updateAppContext } from "../repo/appRepo";
import { syncRoomsRepo } from "@/features/rooms/repo/roomsRepo";
import { syncContactsRepo } from "@/features/contacts/repo/contactsRepo";
import { syncMessagesRepo } from "@/features/messaging/repo/messagesRepo";

export const useAppBootstrap = ({
  appStatus,
  auth,
  setAuth,
  setAppStatus,
}: {
  appStatus: AppStatus;
  auth: Auth;
  setAuth: (auth: Auth) => void;
  setAppStatus: (status: AppStatus) => void;
}) => {
  useEffect(() => {
    if (appStatus !== "idle" || auth.authStatus === "unauthenticated") return;
    const controller = new AbortController();

    const verificationService = async () => {
      const response = await verifyRefreshTokenGateway();

      if (controller.signal.aborted) return;

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

    verificationService();

    return () => {
      controller.abort();
    };
  }, [appStatus, setAuth, setAppStatus, auth]);

  useEffect(() => {
    if (appStatus !== "syncing" || auth.authStatus !== "authenticated") return;

    const syncService = async () => {
      const context = await getAppContext(auth);

      if (!context) return;

      const syncResponse = await appSyncGateway({
        since: undefined,
      });

      if (!syncResponse.success) return;

      const lastSync = new Date().toISOString();
      await updateAppContext({ user: auth.user, lastSync });
      await syncRoomsRepo({ rooms: syncResponse.data.rooms });
      await syncContactsRepo({ contacts: syncResponse.data.contacts });
      await syncMessagesRepo({ messages: syncResponse.data.messages });

      setAppStatus("synced");
    };

    syncService();
  }, [appStatus, auth, setAppStatus]);
};
