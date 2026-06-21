import { httpClient } from "@/lib/httpClient";

export const appSyncGateway = async ({ since }: { since?: string }) => {
  const response = await httpClient.get(
    `/user/sync?${since ? `since=${since}` : ""}`,
  );

  return response.data;
};
