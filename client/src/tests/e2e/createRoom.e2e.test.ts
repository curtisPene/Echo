import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { authControllers, roomsControllers } from "@/composition";
import { db } from "@/infrastructure/sync/db";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import { useActiveRoom } from "@/stores/useActiveRoom";
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
  useActiveRoom.setState({ activeRoom: null });
  await db.rooms.clear();
  await db.contacts.clear();
  await db.blockedContacts.clear();
  await db.messages.clear();
  await db.syncContext.clear();
});

describe("create room", () => {
  it("creates a real group room with two other real users and persists it to Dexie", async () => {
    const creatorEmail = uniqueEmail();
    const secondEmail = uniqueEmail();
    const thirdEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: creatorEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

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

    await authControllers.register({
      firstName: "Katherine",
      lastName: "Johnson",
      email: thirdEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: thirdEmail, password: PASSWORD });
    const thirdAuth = useAuth.getState();
    if (thirdAuth.authStatus !== "authenticated") {
      throw new Error("Expected third account to be authenticated");
    }
    const thirdUserId = thirdAuth.user.id;

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: creatorEmail, password: PASSWORD });
    const creatorAuth = useAuth.getState();
    if (creatorAuth.authStatus !== "authenticated") {
      throw new Error("Expected creator account to be authenticated");
    }

    const result = await roomsControllers.createRoom({
      user: creatorAuth.user,
      contacts: [
        {
          userId: secondUserId,
          firstName: "Grace",
          lastName: "Hopper",
          email: secondEmail,
        },
        {
          userId: thirdUserId,
          firstName: "Katherine",
          lastName: "Johnson",
          email: thirdEmail,
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("unreachable");
    expect(result.name).toBe("Ada, Grace, Katherine");

    const persistedRoom = await db.rooms.get(result.roomId);
    expect(persistedRoom?.participants).toHaveLength(3);

    expect(useActiveRoom.getState().activeRoom?.id).toBe(result.roomId);

    // Clean up: delete the creator (cascades - group room, so the creator is
    // just removed as a participant rather than the room being deleted, per
    // DeleteUserAccountService's group-room branch), then the other two.
    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: secondEmail, password: PASSWORD });
    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: thirdEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });
});
