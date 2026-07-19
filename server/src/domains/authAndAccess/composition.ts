import { userRepo } from "./repo/UserRepo";
import { contactsRepo } from "./repo/ContactsRepo";
import { BcryptPasswordHasher } from "./adapters/BCryptAdapter";
import { JwtTokenSigner } from "./adapters/JWTTokenAdapter";
import { SocketIOAuthAndAccessSocket } from "./adapters/SocketIOAuthAndAccessSocket";
import { LoginService } from "./services/LoginService";
import { RegistrationService } from "./services/RegistrationService";
import { VerifyAccessTokenService } from "./services/VerifyAccessTokenService";
import { VerifyRefreshTokenService } from "./services/VerifyRefreshTokenService";
import { SearchUserService } from "./services/SearchUserService";
import { FindUserIdentitiesService } from "./services/FindUserIdentitiesService";
import { VerifyUserIdService } from "./services/VerifyUserIdService";
import { GetUsersContactsService } from "./services/GetUsersContactsService";
import { DeleteUserAccountService } from "./services/DeleteUserAccountService";
import { AddContactService } from "./services/AddContactService";
import { BlockContactService } from "./services/BlockContactService";
import { SyncUserDataService } from "./services/SyncUserDataService";
import { AddUserToRoomsService } from "./services/AddUserToRoomsService";
import { RoomRepo } from "../conversations/repo/mongooseRoomRepo";
import { FindRoomsForUserService } from "../conversations/services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "../conversations/services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../conversations/services/DeleteRoomService";
import { CreateNewRoomService } from "../conversations/services/createNewRoomService";
import { DeleteRoomMessagesService } from "../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../messaging/services/RedactUserMessagesInRoomService";
import { FindRoomMessagesService } from "../messaging/services/FindRoomMessagesService";

const passwordHasher = new BcryptPasswordHasher();
const tokenSigner = new JwtTokenSigner();
const authAndAccessSocket = new SocketIOAuthAndAccessSocket();

export const loginService = new LoginService(
  userRepo,
  passwordHasher,
  tokenSigner,
);
export const registrationService = new RegistrationService(
  userRepo,
  contactsRepo,
  passwordHasher,
);
export const verifyAccessTokenService = new VerifyAccessTokenService(
  tokenSigner,
);
export const verifyRefreshTokenService = new VerifyRefreshTokenService(
  userRepo,
  tokenSigner,
);
export const searchUserService = new SearchUserService(userRepo, contactsRepo);
export const findUserIdentitiesService = new FindUserIdentitiesService(
  userRepo,
);
export const verifyUserIdService = new VerifyUserIdService(userRepo);
export const getUsersContactsService = new GetUsersContactsService(
  contactsRepo,
);
const roomRepo = new RoomRepo(findUserIdentitiesService);
export const deleteUserAccountService = new DeleteUserAccountService(
  userRepo,
  contactsRepo,
  authAndAccessSocket,
  new FindRoomsForUserService(roomRepo),
  new RemoveParticipantFromRoomService(roomRepo),
  new DeleteRoomService(roomRepo),
  new DeleteRoomMessagesService(),
  new RedactUserMessagesInRoomService(),
);
export const createNewRoomService = new CreateNewRoomService(
  verifyUserIdService,
  getUsersContactsService,
  findUserIdentitiesService,
  roomRepo,
);
export const addContactService = new AddContactService(
  userRepo,
  contactsRepo,
  authAndAccessSocket,
  createNewRoomService,
);
export const blockContactService = new BlockContactService(
  userRepo,
  contactsRepo,
  authAndAccessSocket,
  new FindRoomsForUserService(roomRepo),
  new RemoveParticipantFromRoomService(roomRepo),
  new DeleteRoomService(roomRepo),
  new DeleteRoomMessagesService(),
  new RedactUserMessagesInRoomService(),
);
export const syncUserDataService = new SyncUserDataService(
  contactsRepo,
  new FindRoomsForUserService(roomRepo),
  new FindRoomMessagesService(),
);
export const addUserToRoomsService = new AddUserToRoomsService(
  new FindRoomsForUserService(roomRepo),
);
