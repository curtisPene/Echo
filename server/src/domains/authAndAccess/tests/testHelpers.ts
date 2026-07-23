import { expect } from "vitest";
import { registrationService, loginService } from "../../../composition";
import { User as UserDoc } from "../models/userModel";
import { Contacts as ContactsDoc } from "../models/contactsModel";
import { Room as RoomDoc } from "../../conversations/models/roomModel";
import { Message as MessageDoc } from "../../messaging/models/messageModel";
import type { AuthAndAccessSocket } from "../ports/AuthAndAccessSocket";
import type { MessagingSocket } from "../../messaging/ports/MessagingSocket";
import type { PresenceRepository } from "../../presence/ports/PresenceRepository";

export const PASSWORD = "Password1!";

export const uniqueEmail = (label: string) =>
  `test-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

/**
 * Creates a test user logs them in and returns the response data
 */
export async function registerAndLogin(
  label: string,
  email = uniqueEmail(label),
) {
  const registered = await registrationService.execute({
    firstName: label,
    lastName: "Demo",
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });
  expect(registered.success).toBe(true);

  const login = await loginService.execute({ email, password: PASSWORD });
  expect(login.success).toBe(true);
  if (!login.success) throw new Error("unreachable");

  return login.data.user;
}

/**
 * Deletes a test user via raw, direct Mongo operations - no repos, no
 * domain models, no services. Used instead of the real
 * deleteUserAccountService for test cleanup, since that service's composed
 * instance uses the real SocketIOAuthAndAccessSocket, which throws when no
 * socket server is attached (as in these tests) - a throw that was being
 * silently swallowed by the service's own try/catch, meaning cleanup had
 * been failing unnoticed. Deliberately bypasses all application code so
 * cleanup can't be broken by a bug in a service/domain model/repo - it only
 * needs to delete data, never needs to be "correct" in a domain sense.
 */
export async function cleanupUser(user: { id: string }) {
  const rooms = await RoomDoc.find({ "participants.user": user.id });
  const roomIds = rooms.map((room) => room._id);

  await MessageDoc.deleteMany({ room: { $in: roomIds } });
  await RoomDoc.deleteMany({ _id: { $in: roomIds } });
  await ContactsDoc.updateMany(
    { $or: [{ contacts: user.id }, { blocked: user.id }] },
    { $pull: { contacts: user.id, blocked: user.id } },
  );
  await ContactsDoc.deleteOne({ user: user.id });
  await UserDoc.deleteOne({ _id: user.id });
}

export function createFakeSocket() {
  const calls: { method: string; args: unknown }[] = [];

  const socket: AuthAndAccessSocket = {
    joinRoom: async (params) => {
      calls.push({ method: "joinRoom", args: params });
    },
    leaveRoom: async (params) => {
      calls.push({ method: "leaveRoom", args: params });
    },
    emitToUser: async (params) => {
      calls.push({ method: "emitToUser", args: params });
    },
    emitToRoom: async (params) => {
      calls.push({ method: "emitToRoom", args: params });
    },
    disconnectUser: async (params) => {
      calls.push({ method: "disconnectUser", args: params });
    },
  };

  return { socket, calls };
}

export function createFakeMessagingSocket() {
  const calls: { method: string; args: unknown }[] = [];

  const socket: MessagingSocket = {
    emitToRoom: async (params) => {
      calls.push({ method: "emitToRoom", args: params });
    },
  };

  return { socket, calls };
}

export function createFakePresenceRepo() {
  const calls: { method: string; args: unknown }[] = [];

  const repo: PresenceRepository = {
    setOnline: async (params) => {
      calls.push({ method: "setOnline", args: params });
    },
    setOffline: async (params) => {
      calls.push({ method: "setOffline", args: params });
    },
    getOnlineStatuses: async (params) => {
      calls.push({ method: "getOnlineStatuses", args: params });
      return Object.fromEntries(params.userIds.map((userId) => [userId, false]));
    },
  };

  return { repo, calls };
}
