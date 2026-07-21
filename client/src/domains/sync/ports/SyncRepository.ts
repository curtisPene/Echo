import type { SyncContext } from "../entities/syncContext";

export interface SyncRepository {
  getSyncContext(): Promise<SyncContext | undefined>;
  saveSyncContext(context: SyncContext): Promise<void>;
  dropDatabase(): Promise<void>;
}
