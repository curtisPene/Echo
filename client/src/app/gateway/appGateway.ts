import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { appSyncResponseSchema } from "../types";

export const appSyncGateway = async ({ since }: { since?: string }) => {
  const response = await httpClient.get(
    `/user/sync?${since ? `since=${since}` : ""}`,
  );

  return parseOrReportError(appSyncResponseSchema, response.data);
};
