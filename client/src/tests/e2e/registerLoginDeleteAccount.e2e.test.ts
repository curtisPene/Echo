import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { authControllers } from "@/composition";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import { assertServerIsRunning } from "./assertServerIsRunning";

// Requires the real server running locally (see README "Running locally") at
// the URL in client/.env's VITE_API_URL. Not run as part of the default
// `npm test` - deliberately separate and expensive, see `npm run test:e2e`.
// Proves the seam between the two independently-tested systems: real request
// shapes, real response shapes, real cookies/tokens over the real wire - not
// re-testing either side's own internal logic, which their own suites already
// cover.

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const PASSWORD = "Password1!";

beforeAll(async () => {
  await assertServerIsRunning();
});

beforeEach(() => {
  useAuth.setState({ authStatus: "unverified", user: null });
  useAppStatus.setState({ appStatus: "idle" });
});

describe("register -> login -> delete account", () => {
  it("registers a real account, logs in, and deletes it end to end", async () => {
    const email = uniqueEmail();

    const registerResult = await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    expect(registerResult).toEqual({ success: true });

    const loginResult = await authControllers.login({ email, password: PASSWORD });

    expect(loginResult).toEqual({ success: true });

    const auth = useAuth.getState();
    if (auth.authStatus !== "authenticated") {
      throw new Error("Expected auth to be authenticated after login");
    }
    expect(auth.user.email).toBe(email);
    expect(typeof auth.accessToken).toBe("string");
    expect(useAppStatus.getState().appStatus).toBe("syncing");

    const deleteResult = await authControllers.deleteAccount();

    expect(deleteResult.success).toBe(true);
    expect(useAuth.getState().authStatus).toBe("unauthenticated");
    expect(useAppStatus.getState().appStatus).toBe("idle");

    const loginAfterDelete = await authControllers.login({
      email,
      password: PASSWORD,
    });

    expect(loginAfterDelete.success).toBe(false);
  });
});
