import type { ServiceResult } from "@/types";
import type { User } from "../entities/user";
import type { ContactDTO } from "../entities/contacts";
import type { RoomDTO } from "@/domains/conversations/entities/room";
import type { BlockedRoomResult } from "../types";

export interface ContactsApi {
  search(email: string): Promise<ServiceResult<User>>;

  add(params: {
    contactId: string;
  }): Promise<ServiceResult<{ addedUser: ContactDTO; room: RoomDTO }>>;

  block(params: {
    blockedContactId: string;
  }): Promise<
    ServiceResult<{ blockedContactId: string; updatedRooms: BlockedRoomResult[] }>
  >;
}
