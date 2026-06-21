import type { User } from "@/features/auth/types";
import { db } from "@/lib/db";
import type { Auth } from "@/stores/useAuth";

export async function getAppContext(
  auth: Extract<Auth, { authStatus: "authenticated" }>,
) {
  const { user } = auth;
  const context = await db.appcontext.get("current");
  if (!context) {
    db.appcontext.add({
      id: "current",
      lastSync: null,
      user,
    });
  }

  return await db.appcontext.get("current");
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
