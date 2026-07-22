import type { SyncService } from "../services/SyncService";
import { useAppStatus } from "@/stores/useAppStatus";
import { useAuth, type Auth } from "@/stores/useAuth";

export class SyncControllers {
  private readonly syncService: SyncService;

  constructor(syncService: SyncService) {
    this.syncService = syncService;
  }

  sync = async ({
    auth,
  }: {
    auth: Extract<Auth, { authStatus: "authenticated" }>;
  }) => {
    const result = await this.syncService.execute({ auth });

    if (!result.success) {
      useAuth.getState().setAuth({ authStatus: "unauthenticated", user: null });
      useAppStatus.getState().setAppStatus("syncFail");
      return;
    }

    useAppStatus.getState().setAppStatus("synced");
  };
}
