import type { User } from "@/domains/authAndAccess/entities/user";
import { db } from "./db";
import type { Auth } from "@/stores/useAuth";
import type { AppContext } from "./types";

export async function getAppContext() {
  return await db.appcontext.get("current");
}
export async function createAppContext(
  auth: Extract<Auth, { authStatus: "authenticated" }>,
) {
  const user = auth.user;
  const lastSync = null;
  await db.appcontext.add({ id: "current", user, lastSync });

  return { user, lastSync } as AppContext;
}

export async function updateAppContext({
  user,
  lastSync,
}: {
  user: User;
  lastSync: string;
}) {
  const context = await db.appcontext.get("current");
  if (context) {
    await db.appcontext.update("current", { user, lastSync });
  }
}

export async function dropDatabase() {
  await db.delete();
  await db.open();
}
