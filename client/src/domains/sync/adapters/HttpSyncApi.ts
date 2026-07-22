import { httpClient } from "@/lib/httpClient";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { appSyncResponseSchema } from "../types";
import type { SyncApi } from "../ports/SyncApi";

export class HttpSyncApi implements SyncApi {
  async fetchSyncData({ since }: { since?: string }) {
    const response = await httpClient.get(
      `/sync/user?${since ? `since=${since}` : ""}`,
    );

    return parseOrThrow(appSyncResponseSchema, response.data);
  }
}
