import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import {
  authControllers,
  contactsControllers,
  roomsControllers,
} from "@/composition";
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

describe("contact block", () => {
  it("blocking a 1:1 contact deletes the room and moves the contact to blocked", async () => {
    const firstEmail = uniqueEmail();
    const secondEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: firstEmail,
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

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: firstEmail, password: PASSWORD });

    const addResult = await contactsControllers.addContact({
      contactId: secondUserId,
    });
    expect(addResult.success).toBe(true);
    if (!addResult.success) throw new Error("unreachable");
    const roomId = addResult.room.id;

    const blockResult = await contactsControllers.blockContact({
      blockedContact: addResult.contact,
    });

    expect(blockResult).toEqual({
      success: true,
      blockedContactId: secondUserId,
    });

    expect(await db.contacts.get(secondUserId)).toBeUndefined();
    expect(await db.blockedContacts.get(secondUserId)).toEqual(
      addResult.contact,
    );
    expect(await db.rooms.get(roomId)).toBeUndefined();

    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: secondEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });

  it("blocking a contact in a group room removes the blocker but keeps the room and the blocked user in it", async () => {
    const blockerEmail = uniqueEmail();
    const blockedEmail = uniqueEmail();
    const thirdEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: blockerEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    await authControllers.register({
      firstName: "Grace",
      lastName: "Hopper",
      email: blockedEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    await authControllers.login({ email: blockedEmail, password: PASSWORD });
    const blockedAuth = useAuth.getState();
    if (blockedAuth.authStatus !== "authenticated") {
      throw new Error("Expected blocked account to be authenticated");
    }
    const blockedUserId = blockedAuth.user.id;

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
    await authControllers.login({ email: blockerEmail, password: PASSWORD });
    const blockerAuth = useAuth.getState();
    if (blockerAuth.authStatus !== "authenticated") {
      throw new Error("Expected blocker account to be authenticated");
    }

    const createResult = await roomsControllers.createRoom({
      user: blockerAuth.user,
      contacts: [
        {
          userId: blockedUserId,
          firstName: "Grace",
          lastName: "Hopper",
          email: blockedEmail,
        },
        {
          userId: thirdUserId,
          firstName: "Katherine",
          lastName: "Johnson",
          email: thirdEmail,
        },
      ],
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) throw new Error("unreachable");
    const roomId = createResult.roomId;

    const blockResult = await contactsControllers.blockContact({
      blockedContact: {
        userId: blockedUserId,
        firstName: "Grace",
        lastName: "Hopper",
        email: blockedEmail,
      },
    });

    expect(blockResult).toEqual({
      success: true,
      blockedContactId: blockedUserId,
    });

    const persistedRoom = await db.rooms.get(roomId);
    expect(persistedRoom).toBeDefined();
    const participantIds = persistedRoom?.participants.map((p) => p.userId);
    expect(participantIds).not.toContain(blockerAuth.user.id);
    expect(participantIds).toContain(blockedUserId);
    expect(participantIds).toContain(thirdUserId);

    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: blockedEmail, password: PASSWORD });
    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: thirdEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });
});
