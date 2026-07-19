import { userRepo } from "../authAndAccess/repo/UserRepo";
import { contactsRepo } from "../authAndAccess/repo/ContactsRepo";
import { VerifyUserIdService } from "../authAndAccess/services/VerifyUserIdService";
import { GetUsersContactsService } from "../authAndAccess/services/GetUsersContactsService";
import { FindUserIdentitiesService } from "../authAndAccess/services/FindUserIdentitiesService";
import { SocketIOAuthAndAccessSocket } from "../authAndAccess/adapters/SocketIOAuthAndAccessSocket";
import { RoomRepo } from "./repo/mongooseRoomRepo";
import { FindRoomsForUserService } from "./services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "./services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "./services/DeleteRoomService";
import { CreateNewRoomService } from "./services/createNewRoomService";
import { AcceptRoomInviteService } from "./services/AcceptRoomInviteService";

const findUserIdentitiesService = new FindUserIdentitiesService(userRepo);
const roomRepo = new RoomRepo(findUserIdentitiesService);
const authAndAccessSocket = new SocketIOAuthAndAccessSocket();

export const findRoomsForUserService = new FindRoomsForUserService(roomRepo);
export const removeParticipantFromRoomService = new RemoveParticipantFromRoomService(roomRepo);
export const deleteRoomService = new DeleteRoomService(roomRepo);
export const createNewRoomService = new CreateNewRoomService(
  new VerifyUserIdService(userRepo),
  new GetUsersContactsService(contactsRepo),
  findUserIdentitiesService,
  roomRepo,
);
export const acceptRoomInviteService = new AcceptRoomInviteService(roomRepo, authAndAccessSocket);
