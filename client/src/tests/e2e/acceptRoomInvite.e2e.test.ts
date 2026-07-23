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

describe("accept room invite", () => {
  it("lets the invited real user accept a pending room invite", async () => {
    const creatorEmail = uniqueEmail();
    const inviteeEmail = uniqueEmail();

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
      email: inviteeEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    await authControllers.login({ email: inviteeEmail, password: PASSWORD });
    const inviteeAuth = useAuth.getState();
    if (inviteeAuth.authStatus !== "authenticated") {
      throw new Error("Expected invitee account to be authenticated");
    }
    const inviteeUserId = inviteeAuth.user.id;

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: creatorEmail, password: PASSWORD });
    const creatorAuth = useAuth.getState();
    if (creatorAuth.authStatus !== "authenticated") {
      throw new Error("Expected creator account to be authenticated");
    }

    const createResult = await roomsControllers.createRoom({
      user: creatorAuth.user,
      contacts: [
        {
          userId: inviteeUserId,
          firstName: "Grace",
          lastName: "Hopper",
          email: inviteeEmail,
        },
      ],
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) throw new Error("unreachable");

    // Switch to the invitee and accept the pending invite.
    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: inviteeEmail, password: PASSWORD });

    const acceptResult = await roomsControllers.acceptRequest({
      roomId: createResult.roomId,
    });

    expect(acceptResult).toEqual({ success: true });

    const persistedRoom = await db.rooms.get(createResult.roomId);
    const inviteeParticipant = persistedRoom?.participants.find(
      (p) => p.userId === inviteeUserId,
    );
    expect(inviteeParticipant?.status).toBe("accepted");

    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: creatorEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });
});
