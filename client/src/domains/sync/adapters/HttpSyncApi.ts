import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { appSyncResponseSchema } from "../types";
import type { SyncApi } from "../ports/SyncApi";

export class HttpSyncApi implements SyncApi {
  async fetchSyncData({ since }: { since?: string }) {
    const response = await httpClient.get(
      `/sync/user?${since ? `since=${since}` : ""}`,
    );

    return parseOrReportError(appSyncResponseSchema, response.data);
  }
}
