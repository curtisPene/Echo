import type { ServiceResult } from "@/types";
import type { User } from "../domainModels/user";
import type { ContactDTO } from "../domainModels/contacts";
import type { RoomDTO } from "@/domains/conversations/domainModels/room";

export interface ContactsApi {
  search(email: string): Promise<ServiceResult<User>>;

  add(params: {
    contactId: string;
  }): Promise<ServiceResult<{ addedUser: ContactDTO; room: RoomDTO }>>;
}
