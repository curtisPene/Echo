import { AddContactService } from "../services/addContactService";
import { useAuth } from "@/stores/useAuth";
import type { ContactDTO } from "../domainModels/contacts";

export type AddContactControllerResult =
  | { success: true; contact: ContactDTO }
  | { success: false; message: string };

const addContactService = new AddContactService();

export const addContactController = async ({
  contactId,
}: {
  contactId: string;
}): Promise<AddContactControllerResult> => {
  const auth = useAuth.getState();

  if (auth.authStatus !== "authenticated") {
    return { success: false, message: "Not authenticated" };
  }

  const result = await addContactService.execute({
    userId: auth.user.id,
    contactId,
  });

  if (!result.success || !result.data) {
    return { success: false, message: result.message };
  }

  return { success: true, contact: result.data };
};
