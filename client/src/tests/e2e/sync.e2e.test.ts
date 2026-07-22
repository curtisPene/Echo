import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { authControllers, syncControllers } from "@/composition";
import { db } from "@/infrastructure/sync/db";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import { assertServerIsRunning } from "./assertServerIsRunning";

// Requires the real server running locally (see README "Running locally") at
// the URL in client/.env's VITE_API_URL. Not run as part of the default
// `npm test` - deliberately separate and expensive, see `npm run test:e2e`.

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const PASSWORD = "Password1!";

beforeAll(async () => {
  await assertServerIsRunning();
});

beforeEach(async () => {
  useAuth.setState({ authStatus: "unverified", user: null });
  useAppStatus.setState({ appStatus: "idle" });
  await db.rooms.clear();
  await db.contacts.clear();
  await db.blockedContacts.clear();
  await db.messages.clear();
  await db.syncContext.clear();
});

describe("sync", () => {
  it("syncs a freshly registered account and persists a sync context to Dexie", async () => {
    const email = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    await authControllers.login({ email, password: PASSWORD });

    const auth = useAuth.getState();
    if (auth.authStatus !== "authenticated") {
      throw new Error("Expected auth to be authenticated after login");
    }

    await syncControllers.sync({ auth });

    expect(useAppStatus.getState().appStatus).toBe("synced");

    const storedContext = await db.syncContext.get("current");
    expect(storedContext?.userId).toBe(auth.user.id);
    expect(typeof storedContext?.lastSyncedAt).toBe("string");

    await authControllers.deleteAccount();
  });
});
