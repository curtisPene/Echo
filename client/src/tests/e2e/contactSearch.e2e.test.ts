import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { authControllers, contactsControllers } from "@/composition";
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

describe("contact search", () => {
  it("finds a real second user by email", async () => {
    const searcherEmail = uniqueEmail();
    const targetEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: searcherEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    await authControllers.register({
      firstName: "Grace",
      lastName: "Hopper",
      email: targetEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    await authControllers.login({ email: targetEmail, password: PASSWORD });
    const targetAuth = useAuth.getState();
    if (targetAuth.authStatus !== "authenticated") {
      throw new Error("Expected target account to be authenticated");
    }
    const targetUserId = targetAuth.user.id;

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: searcherEmail, password: PASSWORD });

    const result = await contactsControllers.searchContact({
      email: targetEmail,
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("unreachable");
    expect(result.user.id).toBe(targetUserId);
    expect(result.user.firstName).toBe("Grace");

    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: targetEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });

  it("fails with the real server's message for an email that doesn't exist", async () => {
    const searcherEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: searcherEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    await authControllers.login({ email: searcherEmail, password: PASSWORD });

    const result = await contactsControllers.searchContact({
      email: uniqueEmail(),
    });

    expect(result).toEqual({ success: false, message: "User not found" });

    await authControllers.deleteAccount();
  });
});
