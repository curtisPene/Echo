import type { ServiceResult } from "@/types";
import type { User } from "../entities/user";
import type { ContactDTO } from "../entities/contacts";
import type { RoomDTO } from "@/domains/conversations/entities/room";

export interface ContactsApi {
  search(email: string): Promise<ServiceResult<User>>;

  add(params: {
    contactId: string;
  }): Promise<ServiceResult<{ addedUser: ContactDTO; room: RoomDTO }>>;
}
