import { client } from "../../../redis";
import type { PresenceRepository } from "../ports/PresenceRepository";

const PRESENCE_TTL_SECONDS = 30;
const presenceKey = (userId: string) => `presence:${userId}`;

export class RedisPresenceRepo implements PresenceRepository {
  async setOnline({ userId }: { userId: string }): Promise<void> {
    await client.set(presenceKey(userId), "online", { EX: PRESENCE_TTL_SECONDS });
  }

  async setOffline({ userId }: { userId: string }): Promise<void> {
    await client.del(presenceKey(userId));
  }

  async getOnlineStatuses({
    userIds,
  }: {
    userIds: string[];
  }): Promise<Record<string, boolean>> {
    if (userIds.length === 0) return {};

    const values = await client.mGet(userIds.map(presenceKey));

    return Object.fromEntries(
      userIds.map((userId, i) => [userId, values[i] !== null]),
    );
  }
}
