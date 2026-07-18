// connect/disconnect are Socket.IO's own reserved lifecycle events, not
// app-defined ones - this file exists to give them a domain owner (a
// connection's lifecycle is what triggers this user's data reconciling,
// which is sync's concern) rather than leaving them as untracked bare
// string literals wherever they're used.

export const SyncEvents = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
} as const;
