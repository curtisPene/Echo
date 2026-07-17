import { createNewRoomService } from "../services/createNewRoomService";
import { selectRoomController } from "./SelectRoomController";
import type { User } from "@/domains/authAndAccess/domainModels/user";
import type { ContactDTO } from "@/domains/authAndAccess/domainModels/contacts";

export type CreateNewRoomControllerResult =
  | { success: true; roomId: string; name: string }
  | { success: false; message: string };

export const createNewRoomController = async ({
  user,
  contacts,
}: {
  user: User;
  contacts: ContactDTO[];
}): Promise<CreateNewRoomControllerResult> => {
  const result = await createNewRoomService({ user, contacts });

  if (!result.success || !result.data) {
    return { success: false, message: result.message };
  }

  selectRoomController({ id: result.data.roomId, name: result.data.name });

  return { success: true, roomId: result.data.roomId, name: result.data.name };
};
