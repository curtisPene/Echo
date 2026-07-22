import { httpClient } from "@/lib/httpClient";

export async function assertServerIsRunning() {
  try {
    const response = await httpClient.get("/health");
    if (response.data?.status !== "ok") {
      throw new Error(`Unexpected /health response: ${JSON.stringify(response.data)}`);
    }
  } catch {
    throw new Error(
      `e2e tests require the real server running at ${httpClient.defaults.baseURL} - start it with "cd server && npm run dev" first.`,
    );
  }
}
