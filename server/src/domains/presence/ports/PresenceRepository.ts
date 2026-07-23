export interface PresenceRepository {
  /**
   * Marks a user online with a TTL - self-healing if the process ever dies
   * before a clean disconnect (Socket.IO's own ping/pong already fires a
   * real `disconnect` event for a dead connection; the TTL only exists to
   * recover from the server process itself crashing/restarting).
   */
  setOnline(params: { userId: string }): Promise<void>;

  /**
   * Deletes the online marker for a user - called on graceful disconnect.
   */
  setOffline(params: { userId: string }): Promise<void>;

  /**
   * Batch snapshot read - "who among these users is currently online" for
   * an on-load query (e.g. sync), not a live push.
   */
  getOnlineStatuses(params: { userIds: string[] }): Promise<Record<string, boolean>>;
}
