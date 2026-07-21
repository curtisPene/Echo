import type { AppSyncResponse } from "../types";

export interface SyncApi {
  fetchSyncData(params: { since?: string }): Promise<AppSyncResponse>;
}
