export interface SyncContextDTO {
  userId: string;
  lastSyncedAt: string | null;
}

export class SyncContext {
  readonly userId: string;
  readonly lastSyncedAt: string | null;

  private constructor(dto: SyncContextDTO) {
    this.userId = dto.userId;
    this.lastSyncedAt = dto.lastSyncedAt;
  }

  static hydrate(dto: SyncContextDTO): SyncContext {
    return new SyncContext(dto);
  }

  toDTO(): SyncContextDTO {
    return {
      userId: this.userId,
      lastSyncedAt: this.lastSyncedAt,
    };
  }
}
