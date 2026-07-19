import { userRepo } from "../authAndAccess/repo/UserRepo";
import { contactsRepo } from "../authAndAccess/repo/ContactsRepo";
import { VerifyUserIdService } from "../authAndAccess/services/VerifyUserIdService";
import { GetUsersContactsService } from "../authAndAccess/services/GetUsersContactsService";
import { FindUserIdentitiesService } from "../authAndAccess/services/FindUserIdentitiesService";
import { FindRoomsForUserService } from "./services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "./services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "./services/DeleteRoomService";
import { CreateNewRoomService } from "./services/createNewRoomService";

export const findRoomsForUserService = new FindRoomsForUserService();
export const removeParticipantFromRoomService = new RemoveParticipantFromRoomService();
export const deleteRoomService = new DeleteRoomService();
export const createNewRoomService = new CreateNewRoomService(
  new VerifyUserIdService(userRepo),
  new GetUsersContactsService(contactsRepo),
  new FindUserIdentitiesService(userRepo),
);
