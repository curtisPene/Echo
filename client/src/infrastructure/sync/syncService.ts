import { roomsRepo } from "@/domains/conversations/repo/roomsRepo";
import { appSyncGateway } from "./appGateway";
import {
  createAppContext,
  dropDatabase,
  getAppContext,
  updateAppContext,
} from "./appRepo";
import { contactsRepo } from "@/domains/authAndAccess/repo/contactsRepo";
import { messagesRepo } from "@/domains/messaging/repo/messagesRepo";
import type { Auth } from "@/stores/useAuth";
import type { ServiceResult } from "@/types";

export const syncService = async ({
  auth,
}: {
  auth: Extract<Auth, { authStatus: "authenticated" }>;
}): Promise<ServiceResult<null>> => {
  let context = await getAppContext();

  if (!context) {
    context = await createAppContext(auth);
  }

  // Drop the database if the user has changed
  if (context.user.id !== auth.user.id) {
    console.log("user context changed");
    await dropDatabase();
  }

  const syncResponse = await appSyncGateway({
    since: context.lastSync ?? undefined,
  });

  if (!syncResponse.success) {
    return {
      success: false,
      message: "Sync failed",
      data: null,
    };
  }

  const lastSync = syncResponse.data.lastSync;
  await updateAppContext({ user: auth.user, lastSync });
  await roomsRepo.sync({ rooms: syncResponse.data.rooms });
  await contactsRepo.sync(syncResponse.data.contacts);
  await messagesRepo.sync(syncResponse.data.messages);

  return {
    success: true,
    message: "Sync successful",
    data: null,
  };
};
