import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { authControllers } from "@/composition";
import { httpClient } from "@/lib/httpClient";
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

beforeEach(() => {
  useAuth.setState({ authStatus: "unverified", user: null });
  useAppStatus.setState({ appStatus: "idle" });
});

describe("login -> verify", () => {
  it("registers, logs in, then reuses the refresh-token cookie to re-authenticate a fresh session", async () => {
    const email = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    const loginResult = await authControllers.login({ email, password: PASSWORD });
    expect(loginResult).toEqual({ success: true });

    // Simulate a page reload: the in-memory auth store is wiped, but the
    // refresh-token cookie the login response set survives (it's on the
    // shared cookie jar, not in React/Zustand state).
    useAuth.setState({ authStatus: "unverified", user: null });
    useAppStatus.setState({ appStatus: "idle" });

    await authControllers.verify();

    const auth = useAuth.getState();
    if (auth.authStatus !== "authenticated") {
      throw new Error("Expected auth to be authenticated after verify");
    }
    expect(auth.user.email).toBe(email);
    expect(typeof auth.accessToken).toBe("string");
    expect(useAppStatus.getState().appStatus).toBe("syncing");

    await authControllers.deleteAccount();
  });

  it("fails verify when there is no refresh-token cookie", async () => {
    await httpClient.defaults.jar?.removeAllCookies();

    await authControllers.verify();

    expect(useAuth.getState().authStatus).toBe("unauthenticated");
  });
});
