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

describe("contact add", () => {
  it("adds a real second user as a contact and persists the new 1:1 room to Dexie", async () => {
    const firstEmail = uniqueEmail();
    const secondEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: firstEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    // Register + log in the second account first to obtain its real id.
    await authControllers.register({
      firstName: "Grace",
      lastName: "Hopper",
      email: secondEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    await authControllers.login({ email: secondEmail, password: PASSWORD });

    const secondAuth = useAuth.getState();
    if (secondAuth.authStatus !== "authenticated") {
      throw new Error("Expected second account to be authenticated");
    }
    const secondUserId = secondAuth.user.id;

    // Switch to the first account to perform the add.
    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: firstEmail, password: PASSWORD });

    const firstAuth = useAuth.getState();
    if (firstAuth.authStatus !== "authenticated") {
      throw new Error("Expected first account to be authenticated");
    }

    const result = await contactsControllers.addContact({
      contactId: secondUserId,
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("unreachable");
    expect(result.contact.userId).toBe(secondUserId);
    expect(result.room.participants).toHaveLength(2);

    const persistedContact = await db.contacts.get(secondUserId);
    expect(persistedContact?.userId).toBe(secondUserId);

    const persistedRoom = await db.rooms.get(result.room.id);
    expect(persistedRoom).toBeDefined();

    // Deleting the first account cascades: the 1:1 room is deleted
    // server-side and the second account's contact list is pruned.
    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: secondEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });
});
