import { describe, expect, it, beforeAll, beforeEach, afterEach } from "vitest";
import { io } from "socket.io-client";
import {
  authControllers,
  roomsControllers,
  messagingControllers,
} from "@/composition";
import { db } from "@/infrastructure/sync/db";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { useSocketState } from "@/stores/useSocket";
import { socket, type Socket } from "@/lib/socket";
import { connectRealtimeSocket } from "@/app/socket/connectRealtimeSocket";
import { assertServerIsRunning } from "./assertServerIsRunning";

// Requires the real server running locally (see README "Running locally") at
// the URL in client/.env's VITE_API_URL. Not run as part of the default
// `npm test` - deliberately separate and expensive, see `npm run test:e2e`.
//
// NOTE: server-side authorization for message:send is join-status only
// (socket.rooms.has(roomId)), not accepted-status - a pending participant's
// socket can technically send too. This is a deliberate tradeoff, not a bug:
// checking accepted-status on every send would cost a DB lookup per message,
// and the "loophole" has no exploit value (only reachable by modifying your
// own client, and only lets you message a room you're already a real
// participant of, as yourself). This test exercises the real happy path (an
// ACCEPTED participant sending) since that's the normal case, not because
// the pending case needs to be routed around.
//
// NOTE: there is no separate "receive message" e2e test file - it's covered
// here already. emitToRoom broadcasts message:receive to every socket in the
// room, including the sender's own, so the group-chat test below already
// proves real fan-out receipt on separate live sockets, and the 1:1 test's
// Dexie assertion after send already proves the real onMessageReceive ->
// MessageReceiveService -> Dexie consume path for one accepted participant.
// The receive side has no participant-count-dependent branching of its own -
// it's the identical handler regardless of room size - so a dedicated
// receive-only test would just re-prove what's already covered here.

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const PASSWORD = "Password1!";

function waitForConnect() {
  return new Promise<void>((resolve) => {
    if (socket.connected) return resolve();
    socket.once("connect", () => resolve());
  });
}

function waitForMessageReceive(rawSocket: Socket) {
  return new Promise<unknown>((resolve) => {
    rawSocket.once("message:receive", resolve);
  });
}

function connectRawSocket(auth: {
  user: { id: string };
  accessToken: string;
}): Socket {
  const rawSocket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    auth: { id: auth.user.id, accessToken: auth.accessToken },
  });
  return rawSocket as unknown as Socket;
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

describe("send message", () => {
  it("sends a real message over a live socket connection and persists it to Dexie", async () => {
    const senderEmail = uniqueEmail();
    const receiverEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: senderEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    await authControllers.register({
      firstName: "Grace",
      lastName: "Hopper",
      email: receiverEmail,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    await authControllers.login({ email: receiverEmail, password: PASSWORD });
    const receiverAuth = useAuth.getState();
    if (receiverAuth.authStatus !== "authenticated") {
      throw new Error("Expected receiver account to be authenticated");
    }
    const receiverUserId = receiverAuth.user.id;

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: senderEmail, password: PASSWORD });
    const senderAuth = useAuth.getState();
    if (senderAuth.authStatus !== "authenticated") {
      throw new Error("Expected sender account to be authenticated");
    }

    const createResult = await roomsControllers.createRoom({
      user: senderAuth.user,
      contacts: [
        {
          userId: receiverUserId,
          firstName: "Grace",
          lastName: "Hopper",
          email: receiverEmail,
        },
      ],
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) throw new Error("unreachable");

    // The receiver must actually accept - message:send authorization is only
    // ever exercised meaningfully once the sender's own socket has (re)joined
    // post-creation, and this keeps the room in the intended "real
    // conversation" state rather than the pending-only loophole noted above.
    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: receiverEmail, password: PASSWORD });
    const acceptResult = await roomsControllers.acceptRequest({
      roomId: createResult.roomId,
    });
    expect(acceptResult).toEqual({ success: true });

    // Switch back to the sender and connect a real socket so message:send has
    // an authenticated connection to emit over.
    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: senderEmail, password: PASSWORD });
    const reconnectedSenderAuth = useAuth.getState();
    if (reconnectedSenderAuth.authStatus !== "authenticated") {
      throw new Error("Expected sender account to be authenticated");
    }

    const cleanupSocket = connectRealtimeSocket({
      auth: reconnectedSenderAuth,
      setOnlineStatus: (status) => useSocketState.setState({ onlineStatus: status }),
    });
    await waitForConnect();

    const sendResult = await messagingControllers.sendMessage({
      text: "hello from the e2e suite",
      roomId: createResult.roomId,
    });

    expect(sendResult).toEqual({ success: true });

    const messagesInRoom = await db.messages
      .where("roomId")
      .equals(createResult.roomId)
      .toArray();
    expect(messagesInRoom).toHaveLength(1);
    expect(messagesInRoom[0].text).toBe("hello from the e2e suite");
    expect(messagesInRoom[0].sender?.userId).toBe(reconnectedSenderAuth.user.id);

    cleanupSocket();
    socket.disconnect();

    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: receiverEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });

  it("broadcasts a group-chat message to every other accepted participant's live socket", async () => {
    const senderEmail = uniqueEmail();
    const secondEmail = uniqueEmail();
    const thirdEmail = uniqueEmail();

    await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: senderEmail,
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
    await authControllers.login({ email: senderEmail, password: PASSWORD });
    const senderAuth = useAuth.getState();
    if (senderAuth.authStatus !== "authenticated") {
      throw new Error("Expected sender account to be authenticated");
    }

    const createResult = await roomsControllers.createRoom({
      user: senderAuth.user,
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
    expect(createResult.success).toBe(true);
    if (!createResult.success) throw new Error("unreachable");

    // Both other participants accept, so message:send's real happy path (an
    // accepted sender broadcasting to accepted peers) is what's exercised -
    // see the note at the top of this file on why pending-status isn't
    // enforced here and doesn't need to be worked around.
    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: secondEmail, password: PASSWORD });
    const secondAcceptResult = await roomsControllers.acceptRequest({
      roomId: createResult.roomId,
    });
    expect(secondAcceptResult).toEqual({ success: true });
    // Connect the second participant's own live socket AFTER accepting, so
    // AddUserToRoomsService's connect-time join picks up this room.
    const secondSocket = connectRawSocket(secondAuth);
    await new Promise<void>((resolve) => secondSocket.once("connect", resolve));

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: thirdEmail, password: PASSWORD });
    const thirdAcceptResult = await roomsControllers.acceptRequest({
      roomId: createResult.roomId,
    });
    expect(thirdAcceptResult).toEqual({ success: true });
    const thirdSocket = connectRawSocket(thirdAuth);
    await new Promise<void>((resolve) => thirdSocket.once("connect", resolve));

    // Switch back to the sender and connect its own socket to actually send.
    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: senderEmail, password: PASSWORD });
    const reconnectedSenderAuth = useAuth.getState();
    if (reconnectedSenderAuth.authStatus !== "authenticated") {
      throw new Error("Expected sender account to be authenticated");
    }
    const cleanupSocket = connectRealtimeSocket({
      auth: reconnectedSenderAuth,
      setOnlineStatus: (status) => useSocketState.setState({ onlineStatus: status }),
    });
    await waitForConnect();

    const secondReceivePromise = waitForMessageReceive(secondSocket);
    const thirdReceivePromise = waitForMessageReceive(thirdSocket);

    const sendResult = await messagingControllers.sendMessage({
      text: "hello group chat",
      roomId: createResult.roomId,
    });
    expect(sendResult).toEqual({ success: true });

    const [secondReceived, thirdReceived] = await Promise.all([
      secondReceivePromise,
      thirdReceivePromise,
    ]);

    expect(secondReceived).toMatchObject({
      success: true,
      data: { message: { text: "hello group chat" } },
    });
    expect(thirdReceived).toMatchObject({
      success: true,
      data: { message: { text: "hello group chat" } },
    });

    cleanupSocket();
    socket.disconnect();
    secondSocket.disconnect();
    thirdSocket.disconnect();

    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: secondEmail, password: PASSWORD });
    await authControllers.deleteAccount();

    useAuth.setState({ authStatus: "unverified", user: null });
    await authControllers.login({ email: thirdEmail, password: PASSWORD });
    await authControllers.deleteAccount();
  });

  it("rejects sending when not authenticated and not online, instead of hanging or throwing raw", async () => {
    useAuth.setState({ authStatus: "unauthenticated", user: null });
    useSocketState.setState({ onlineStatus: "offline" });
    expect(socket.connected).toBe(false);

    const sendResult = await messagingControllers.sendMessage({
      text: "should never be sent",
      roomId: "does-not-matter",
    });

    expect(sendResult).toEqual({
      success: false,
      message: expect.any(String),
    });
    expect(await db.messages.count()).toBe(0);
  }, 10000);
});
