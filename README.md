# Echo

A real-time messaging application built to prove out a specific problem: combining Socket.IO (live, bidirectional) and HTTP (request/response) cleanly under **Hexagonal Architecture (Ports & Adapters)**, on both the client and the server.

Chat was chosen as the domain because it's the simplest product that genuinely needs both transports at once — a message send is a live event, but auth, sync, and room creation are ordinary requests. Any product needing live bidirectional state (ride-sharing, delivery tracking, collaborative editing) needs the same underlying pattern; chat just makes it easy to build and demo. The architecture, not the chat product itself, is the point.

## Architecture

Echo is built on **Hexagonal Architecture (Ports & Adapters)**, applied consistently across both client and server. Business logic (use cases) never imports a framework directly — it depends on a *port* (an interface), and a concrete *adapter* (Express route, Mongoose repo, Dexie table, Socket.IO handler) implements that port. Swap Mongo for Postgres, or REST for gRPC, and the use cases underneath don't change. This isn't cargo-culted from a blog post — it's the load-bearing decision that made every feature below tractable to build correctly the first time, including the harder ones.

**The interesting engineering problem this project actually solves:** most chat tutorials bolt Socket.IO onto an Express app and let the two transports tangle — sockets reaching into HTTP-layer code, or business logic split unpredictably across both. Echo treats HTTP and WebSocket as two interchangeable *driving adapters* into the same application core. A message send, a room creation, and a login all look identical from the use case's perspective regardless of which transport triggered them — which is what makes it possible to add a new real-time feature without ever touching how an existing HTTP feature works, and vice versa.

**One access boundary, reused for every feature: room/socket membership.** Instead of writing a bespoke authorization check per feature, sending, receiving, pending-request visibility, and blocking all collapse onto a single mechanism — whether a socket is currently joined to a room. Blocking is implemented as a membership mutation (leave the room), not a runtime "is this user blocked" branch in the send path. A pending contact request is purely a client-side label on an inbox thread the recipient can already legitimately see — accepting it changes nothing about access, only where it's displayed. The payoff: the server's hottest code path, `message:send`, does zero extra authorization work, while the client is never trusted with anything that actually gates access. Getting this boundary right — and proving out *why* every other tempting check was redundant — was most of the actual design work behind the contact/blocking system.

**Client is offline-first, not just cached.** Every message, room, and contact is persisted locally in IndexedDB (via Dexie) and the UI renders from that local store, not from in-flight network state. The server is reconciled in through a cold sync on load and a single generic `room:updated` live event that any room-mutating action can emit — one push mechanism reused across every feature that changes a room, instead of each feature inventing its own socket event and its own client handler.

**Two real shells, not one responsive layout.** `DesktopShell` and `MobileShell` both mount at the root simultaneously (`RootLayout.tsx`) and visibility is switched purely with responsive Tailwind classes — there's no JS media-query branching deciding which one renders. Each shell has its own navigation model and composes the same feature components differently: desktop is a persistent sidebar + panel layout, mobile is a bottom-tab, single-screen-at-a-time layout closer to a native app than a shrunk-down website. The goal was to make "responsive" mean *two designed experiences sharing one codebase*, not one layout that degrades gracefully.

## Stack

**Client**: React 19, Vite, TypeScript, React Router 7, Zustand (auth state), Axios (HTTP client with auto access-token refresh on 401), Dexie (offline cache/IndexedDB), Zod (schema validation at every API/socket boundary), Tailwind, shadcn/base-ui primitives, Lucide icons.

**Server**: Express 5, TypeScript, MongoDB/Mongoose, Socket.IO, Zod (request/payload validation), JWT auth, Redis (connected, reserved for presence work below — not yet driving any feature).

Zod schemas are the single source of truth for types on both sides — TypeScript types are derived from them (`z.infer`), never hand-duplicated, so a shape only has to be defined once and both validation and typing stay in sync.

## Running locally

No root-level script runner — start client and server independently in separate terminals.

```
cd server && npm install && npm run dev   # http://localhost:3000
cd client && npm install && npm run dev   # http://localhost:5173
```

Server `.env`:
```
JWT_SECRET=
MONGO_URI=
MONGO_DB=echo
PORT=3000
```

Client `.env`:
```
VITE_API_URL=http://localhost:3000
```

## What's built

- **Auth** — registration, login, JWT-based sessions.
- **Contacts** — search by email, add, block (with mutual removal, shared-room cleanup, and live notification to affected users).
- **Real-time messaging** — send/receive over Socket.IO, delivered to every device joined to a room.
- **Contact requests** — Instagram-style: messaging a non-contact creates a pending room instead of requiring mutual acceptance first. The recipient sees it in a separate requests list and can accept from there or implicitly by replying.
- **Offline-first sync** — full state cached in IndexedDB, with delta sync on reconnect and live updates via the shared `room:updated` event.
- **Group chats** — in progress. The domain layer already supports N-participant rooms with no schema or service changes; remaining work is client UI.

## Deferred

- Presence / typing indicators / delivery & read receipts
- Message reactions, edit, delete
- End-to-end encryption

## Current API surface

| Method | Path                       | Purpose                          |
|--------|-----------------------------|-----------------------------------|
| POST   | /auth/register               | Create account                    |
| POST   | /auth/login                  | Authenticate, issue JWT           |
| POST   | /auth/verify                 | Refresh session                   |
| GET    | /user/sync                   | Delta/cold sync of user's data    |
| POST   | /contacts/search              | Search users by email             |
| POST   | /contacts/add                 | Add a contact                     |
| POST   | /contacts/block                | Block a contact                   |
| POST   | /rooms                        | Create a room                     |
| POST   | /rooms/update-participant     | Accept/reject a pending room      |
| GET    | /health                       | Health check                      |

Socket events: `message:send` / `message:receive`, `room:updated`, `room:blocked`.
