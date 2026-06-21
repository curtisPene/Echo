import type { User } from "@/features/auth/types";
import { db } from "@/lib/db";

export async function addContactRepo({ user }: { user: User }) {
  await db.contacts.add(user);
}
