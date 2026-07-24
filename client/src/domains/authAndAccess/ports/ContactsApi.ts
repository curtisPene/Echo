import type { ServiceResult } from "@/types";
import type { User } from "../entities/user";
import type { ContactDTO } from "../entities/contacts";
import { Room } from "@/domains/conversations/entities/room";

export type BlockedRoomUpdate =
  | { roomId: string; room: Room }
  | { roomId: string };

export interface ContactsApi {
  search(email: string): Promise<ServiceResult<User>>;

  add(params: {
    contactId: string;
  }): Promise<ServiceResult<{ addedUser: ContactDTO; room: Room }>>;

  block(params: {
    blockedContactId: string;
  }): Promise<
    ServiceResult<{ blockedContactId: string; updatedRooms: BlockedRoomUpdate[] }>
  >;
}
