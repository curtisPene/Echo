import "dotenv/config";
import { close, mongooseConnect } from "./src/server";
import { User } from "./src/domains/authAndAccess/models/userModel";
import { Contacts } from "./src/domains/authAndAccess/models/contactsModel";
import { Room } from "./src/domains/conversations/models/roomModel";
import { Message } from "./src/domains/messaging/models/messageModel";
import { BcryptPasswordHasher } from "./src/domains/authAndAccess/adapters/BCryptAdapter";

const SEED_PASSWORD = "password123";

// Alan is the dev test account - logged into manually, so his rooms are
// built to cover every situation the UI needs to render: every 1:1/group x
// accepted/pending combination, a self-chat, and message-level variety
// (unread, read, redacted, reacted). Everyone else just needs to exist
// around him plausibly.
const SEED_USERS = [
  { firstName: "Alan", lastName: "Turing", email: "alan@example.com" },
  { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
  { firstName: "Grace", lastName: "Hopper", email: "grace@example.com" },
  { firstName: "Margaret", lastName: "Hamilton", email: "margaret@example.com" },
  { firstName: "Katherine", lastName: "Johnson", email: "katherine@example.com" },
  { firstName: "Blocker", lastName: "Person", email: "blocker@example.com" },
];

async function seed() {
  await mongooseConnect();

  console.log("Wiping existing data...");
  await Promise.all([
    User.deleteMany({}),
    Contacts.deleteMany({}),
    Room.deleteMany({}),
    Message.deleteMany({}),
  ]);

  console.log("Creating users...");
  const passwordHasher = new BcryptPasswordHasher();
  const hashedPassword = await passwordHasher.hash(SEED_PASSWORD);
  const users = await User.create(
    SEED_USERS.map((user) => ({ ...user, password: hashedPassword })),
  );

  const [alan, ada, grace, margaret, katherine, blocker] = users;

  console.log("Creating contacts...");
  await Contacts.create([
    {
      user: alan._id,
      contacts: [ada._id, grace._id, margaret._id, katherine._id],
      blocked: [],
    },
    { user: ada._id, contacts: [alan._id], blocked: [] },
    { user: grace._id, contacts: [alan._id], blocked: [] },
    { user: margaret._id, contacts: [alan._id], blocked: [] },
    { user: katherine._id, contacts: [alan._id], blocked: [] },
    // Blocker has blocked Alan - covers the "blocked contact" state.
    { user: blocker._id, contacts: [], blocked: [alan._id] },
  ]);

  console.log("Creating rooms...");

  // 1:1, accepted - Alan's normal active conversation.
  const dmAccepted = await Room.create({
    name: `${alan.firstName} & ${ada.firstName}`,
    participants: [
      { user: alan._id, status: "accepted" },
      { user: ada._id, status: "accepted" },
    ],
  });

  // 1:1, pending on Alan's side - Grace added Alan, he hasn't accepted yet.
  const dmPendingInvitee = await Room.create({
    name: `${alan.firstName} & ${grace.firstName}`,
    participants: [
      { user: grace._id, status: "accepted" },
      { user: alan._id, status: "pending" },
    ],
  });

  // 1:1, pending on the other side - Alan added Katherine, waiting on her.
  const dmPendingInviter = await Room.create({
    name: `${alan.firstName} & ${katherine.firstName}`,
    participants: [
      { user: alan._id, status: "accepted" },
      { user: katherine._id, status: "pending" },
    ],
  });

  // Group, accepted.
  const groupAccepted = await Room.create({
    name: "NASA Alumni",
    participants: [
      { user: alan._id, status: "accepted" },
      { user: ada._id, status: "accepted" },
      { user: margaret._id, status: "accepted" },
    ],
  });

  // Group, pending on Alan's side.
  const groupPendingInvitee = await Room.create({
    name: "Turing Award Committee",
    participants: [
      { user: grace._id, status: "accepted" },
      { user: margaret._id, status: "accepted" },
      { user: alan._id, status: "pending" },
    ],
  });

  // Self-chat.
  const selfChat = await Room.create({
    name: "Just Me",
    participants: [{ user: alan._id, status: "accepted" }],
  });

  console.log("Creating messages...");

  // dmAccepted: a read message and an unread one, so unread counts and
  // read/delivered status both show up.
  const dmAcceptedMessages = await Message.create([
    {
      room: dmAccepted._id,
      sender: alan._id,
      text: "Hi Ada, how's the analytical engine going?",
      deliveredTo: [ada._id],
      readBy: [{ user: ada._id, readAt: new Date() }],
    },
    {
      room: dmAccepted._id,
      sender: ada._id,
      text: "Slowly, but surely!",
      deliveredTo: [alan._id],
      // Not read by Alan yet - shows up as unread for him.
    },
  ]);

  // dmPendingInvitee: message sent while Alan's invite is still pending.
  const dmPendingInviteeMessages = await Message.create([
    {
      room: dmPendingInvitee._id,
      sender: grace._id,
      text: "Hey Alan, accept my invite when you get a chance!",
      deliveredTo: [alan._id],
    },
  ]);

  // dmPendingInviter: Alan is waiting on Katherine to accept.
  const dmPendingInviterMessages = await Message.create([
    {
      room: dmPendingInviter._id,
      sender: alan._id,
      text: "Katherine, would love to chat about orbital mechanics.",
      deliveredTo: [],
    },
  ]);

  // groupAccepted: a redacted message and a reaction, for message-state
  // variety.
  const groupAcceptedMessages = await Message.create([
    {
      room: groupAccepted._id,
      sender: margaret._id,
      text: "Apollo 11 is go.",
      deliveredTo: [alan._id, ada._id],
      readBy: [
        { user: alan._id, readAt: new Date() },
        { user: ada._id, readAt: new Date() },
      ],
    },
    {
      room: groupAccepted._id,
      sender: alan._id,
      text: "Machines will think one day.",
      deliveredTo: [margaret._id, ada._id],
      reactions: [{ user: ada._id, emoji: "🤖" }],
    },
    {
      room: groupAccepted._id,
      sender: ada._id,
      text: "This message will be deleted",
      redacted: true,
      deliveredTo: [alan._id, margaret._id],
    },
  ]);

  // groupPendingInvitee: chatter happened before Alan was even asked.
  const groupPendingInviteeMessages = await Message.create([
    {
      room: groupPendingInvitee._id,
      sender: grace._id,
      text: "We should nominate Alan for this committee.",
      deliveredTo: [margaret._id],
    },
  ]);

  // selfChat: notes-to-self.
  const selfChatMessages = await Message.create([
    { room: selfChat._id, sender: alan._id, text: "Remember to fix the Bombe." },
  ]);

  await Promise.all([
    Room.findByIdAndUpdate(dmAccepted._id, {
      lastMessageAt: dmAcceptedMessages[dmAcceptedMessages.length - 1].createdAt,
    }),
    Room.findByIdAndUpdate(dmPendingInvitee._id, {
      lastMessageAt:
        dmPendingInviteeMessages[dmPendingInviteeMessages.length - 1].createdAt,
    }),
    Room.findByIdAndUpdate(dmPendingInviter._id, {
      lastMessageAt:
        dmPendingInviterMessages[dmPendingInviterMessages.length - 1].createdAt,
    }),
    Room.findByIdAndUpdate(groupAccepted._id, {
      lastMessageAt:
        groupAcceptedMessages[groupAcceptedMessages.length - 1].createdAt,
    }),
    Room.findByIdAndUpdate(groupPendingInvitee._id, {
      lastMessageAt:
        groupPendingInviteeMessages[groupPendingInviteeMessages.length - 1]
          .createdAt,
    }),
    Room.findByIdAndUpdate(selfChat._id, {
      lastMessageAt: selfChatMessages[selfChatMessages.length - 1].createdAt,
    }),
  ]);

  console.log(`Seeded ${users.length} users, 6 rooms for Alan, messages across all.`);
  console.log(`Login as alan@example.com with password "${SEED_PASSWORD}"`);

  await close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
