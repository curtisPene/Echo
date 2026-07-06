import { syncRoomsRepo } from "@/features/rooms/repo/roomsRepo";
import { appSyncGateway } from "../gateway/appGateway";
import {
  createAppContext,
  dropDatabase,
  getAppContext,
  updateAppContext,
} from "../repo/appRepo";
import { syncContactsRepo } from "@/features/contacts/repo/contactsRepo";
import { syncMessagesRepo } from "@/features/messaging/repo/messagesRepo";
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
  await syncRoomsRepo({ rooms: syncResponse.data.rooms });
  await syncContactsRepo({ contacts: syncResponse.data.contacts });
  await syncMessagesRepo({ messages: syncResponse.data.messages });

  return {
    success: true,
    message: "Sync successful",
    data: null,
  };
};
