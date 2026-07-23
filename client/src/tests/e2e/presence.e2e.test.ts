import { describe, expect, it, beforeAll, beforeEach, afterEach } from "vitest";
import { io } from "socket.io-client";
import { authControllers, contactsControllers } from "@/composition";
import { db } from "@/infrastructure/sync/db";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { useSocketState } from "@/stores/useSocket";
import { socket, type Socket } from "@/lib/socket";
import { connectRealtimeSocket } from "@/app/socket/connectRealtimeSocket";
import { assertServerIsRunning } from "./assertServerIsRunning";

// Requires the real server (and its real Redis connection) running locally -
// see README "Running locally". Proves the actual live flow: connecting one
// user's real socket causes the OTHER (already-connected) user's socket to
// receive user:online, and disconnecting causes user:offline - not just that
// the client-side controller/store logic works against a fake payload.

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const PASSWORD = "Password1!";

function connectRawSocket(auth: { user: { id: string }; accessToken: string }): Socket {
  const rawSocket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    auth: { id: auth.user.id, accessToken: auth.accessToken },
  });
  return rawSocket as unknown as Socket;
}

function waitForEvent(rawSocket: Socket, event: string) {
  return new Promise<unknown>((resolve) => {
    rawSocket.once(event, resolve);
  });
}

beforeAll(async () => {
  await assertServerIsRunning();
});

beforeEach(async () => {
  useAuth.setState({ authStatus: "unverified", user: null });
  useAppStatus.setState({ appStatus: "idle" });
  useActiveRoom.setState({ activeRoom: null });
  useSocketState.setState({ onlineStatus: "offline" });
  await db.rooms.clear();
  await db.contacts.clear();
  await db.blockedContacts.clear();
  await db.messages.clear();
  await db.syncContext.clear();
});

afterEach(() => {
  if (socket.connected) socket.disconnect();
});

describe("presence", () => {
  it("notifies an already-connected contact when the other comes online, then goes offline", async () => {
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
    const firstAuth = useAuth.getState();
    if (firstAuth.authStatus !== "authenticated") {
      throw new Error("Expected first account to be authenticated");
    }

    // Add each other as contacts so presence fan-out has an audience -
    // GetUsersContactsService's contacts list is what UserConnectedService/
    // UserDisconnectedService iterate to decide who to notify.
    await contactsControllers.addContact({ contactId: secondUserId });

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: secondEmail, password: PASSWORD });
    await contactsControllers.addContact({ contactId: firstAuth.user.id });

    // Second user connects first and stays connected - it should observe
    // the first user's connect/disconnect live.
    const secondSocket = connectRawSocket(secondAuth);
    await new Promise<void>((resolve) => secondSocket.once("connect", resolve));

    const onlineEventPromise = waitForEvent(secondSocket, "user:online");

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: firstEmail, password: PASSWORD });
    const reconnectedFirstAuth = useAuth.getState();
    if (reconnectedFirstAuth.authStatus !== "authenticated") {
      throw new Error("Expected first account to be authenticated");
    }

    const cleanupSocket = connectRealtimeSocket({
      auth: reconnectedFirstAuth,
      setOnlineStatus: (status) => useSocketState.setState({ onlineStatus: status }),
    });
    await new Promise<void>((resolve) => socket.once("connect", resolve));

    const onlineEvent = await onlineEventPromise;
    expect(onlineEvent).toEqual({ userId: reconnectedFirstAuth.user.id });

    const offlineEventPromise = waitForEvent(secondSocket, "user:offline");

    cleanupSocket();
    socket.disconnect();

    const offlineEvent = await offlineEventPromise;
    expect(offlineEvent).toEqual({ userId: reconnectedFirstAuth.user.id });

    secondSocket.disconnect();

    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: secondEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });
});
