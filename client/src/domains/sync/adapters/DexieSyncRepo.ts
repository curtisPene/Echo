import { db } from "@/infrastructure/sync/db";
import { SyncContext } from "../entities/syncContext";
import type { SyncRepository } from "../ports/SyncRepository";

export class DexieSyncRepo implements SyncRepository {
  async getSyncContext() {
    const stored = await db.syncContext.get("current");
    return stored ? SyncContext.hydrate(stored) : undefined;
  }

  async saveSyncContext(context: SyncContext) {
    await db.syncContext.put({ id: "current", ...context.toDTO() });
  }

  async dropDatabase() {
    await db.delete();
    await db.open();
  }
}
