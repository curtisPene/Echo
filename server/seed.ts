import "dotenv/config";
import { close, mongooseConnect } from "./src/server";
import { User } from "./src/features/users/models/userModel";
import { Contacts } from "./src/features/contacts/models/contactsModel";
import { Room } from "./src/features/rooms/models/roomModel";
import { Message } from "./src/features/rooms/models/messageModel";
import { hashPassword } from "./src/features/auth/adapters/bcryptAdapter";

const SEED_PASSWORD = "password123";

const SEED_USERS = [
  { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
  { firstName: "Grace", lastName: "Hopper", email: "grace@example.com" },
  { firstName: "Alan", lastName: "Turing", email: "alan@example.com" },
  { firstName: "Margaret", lastName: "Hamilton", email: "margaret@example.com" },
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
  const hashedPassword = await hashPassword(SEED_PASSWORD);
  const users = await User.create(
    SEED_USERS.map((user) => ({ ...user, password: hashedPassword })),
  );

  console.log("Creating contacts...");
  await Contacts.create(
    users.map((user) => ({
      user: user._id,
      contacts: users
        .filter((u) => !u._id.equals(user._id))
        .map((u) => u._id),
      blocked: [],
    })),
  );

  console.log("Creating rooms...");
  const [ada, grace, alan, margaret] = users;

  const dm = await Room.create({
    name: `${ada.firstName} & ${grace.firstName}`,
    participants: [
      { user: ada._id, status: "accepted" },
      { user: grace._id, status: "pending" },
    ],
  });

  const group = await Room.create({
    name: "NASA Alumni",
    participants: [
      { user: ada._id, status: "accepted" },
      { user: alan._id, status: "pending" },
      { user: margaret._id, status: "pending" },
    ],
  });

  console.log("Creating messages...");
  const dmMessages = await Message.create([
    { room: dm._id, sender: ada._id, text: "Hey Grace!" },
    {
      room: dm._id,
      sender: grace._id,
      text: "Hi Ada, how's the analytical engine going?",
      readBy: [{ user: ada._id, readAt: new Date() }],
    },
  ]);

  const groupMessages = await Message.create([
    { room: group._id, sender: margaret._id, text: "Apollo 11 is go." },
    {
      room: group._id,
      sender: alan._id,
      text: "Machines will think one day.",
      reactions: [{ user: ada._id, emoji: "🤖" }],
    },
  ]);

  await Room.findByIdAndUpdate(dm._id, {
    lastMessageAt: dmMessages[dmMessages.length - 1].createdAt,
  });
  await Room.findByIdAndUpdate(group._id, {
    lastMessageAt: groupMessages[groupMessages.length - 1].createdAt,
  });

  console.log(`Seeded ${users.length} users, 2 rooms, 4 messages.`);
  console.log(`Login with any seed email + password "${SEED_PASSWORD}"`);

  await close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
