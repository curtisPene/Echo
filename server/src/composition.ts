import { userRepo } from "./domains/authAndAccess/repo/UserRepo";
import { contactsRepo } from "./domains/authAndAccess/repo/ContactsRepo";
import { RoomRepo } from "./domains/conversations/repo/mongooseRoomRepo";
import { MessageRepo } from "./domains/messaging/repo/mongooseMessageRepo";
import { BcryptPasswordHasher } from "./domains/authAndAccess/adapters/BCryptAdapter";
import { JwtTokenSigner } from "./domains/authAndAccess/adapters/JWTTokenAdapter";
import { SocketIOAuthAndAccessSocket } from "./domains/authAndAccess/adapters/SocketIOAuthAndAccessSocket";
import { SocketIOMessagingSocket } from "./domains/messaging/adapters/SocketIOMessagingSocket";

import { LoginService } from "./domains/authAndAccess/services/LoginService";
import { RegistrationService } from "./domains/authAndAccess/services/RegistrationService";
import { VerifyAccessTokenService } from "./domains/authAndAccess/services/VerifyAccessTokenService";
import { VerifyRefreshTokenService } from "./domains/authAndAccess/services/VerifyRefreshTokenService";
import { SearchUserService } from "./domains/authAndAccess/services/SearchUserService";
import { FindUserIdentitiesService } from "./domains/authAndAccess/services/FindUserIdentitiesService";
import { VerifyUserIdService } from "./domains/authAndAccess/services/VerifyUserIdService";
import { GetUsersContactsService } from "./domains/authAndAccess/services/GetUsersContactsService";
import { DeleteUserAccountService } from "./domains/authAndAccess/services/DeleteUserAccountService";
import { AddContactService } from "./domains/authAndAccess/services/AddContactService";
import { BlockContactService } from "./domains/authAndAccess/services/BlockContactService";
import { SyncUserDataService } from "./domains/sync/services/SyncUserDataService";
import { AddUserToRoomsService } from "./domains/authAndAccess/services/AddUserToRoomsService";

import { FindRoomsForUserService } from "./domains/conversations/services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "./domains/conversations/services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "./domains/conversations/services/DeleteRoomService";
import { CreateNewRoomService } from "./domains/conversations/services/createNewRoomService";
import { AcceptRoomInviteService } from "./domains/conversations/services/AcceptRoomInviteService";

import { FindRoomMessagesService } from "./domains/messaging/services/FindRoomMessagesService";
import { DeleteRoomMessagesService } from "./domains/messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "./domains/messaging/services/RedactUserMessagesInRoomService";
import { CreateMessageService } from "./domains/messaging/services/createMessageService";

import { AuthControllers } from "./domains/authAndAccess/controllers/authHttpControllers";
import { ContactsControllers } from "./domains/authAndAccess/controllers/contactsHttpControllers";
import { SyncControllers } from "./domains/sync/controllers/httpControllers";
import { RoomsControllers } from "./domains/conversations/controllers/httpControllers";
import { MessagingControllers } from "./domains/messaging/controllers/socketControllers";

// 1. Repos and adapters - the leaves, no dependencies on any service.
const passwordHasher = new BcryptPasswordHasher();
const tokenSigner = new JwtTokenSigner();
const authAndAccessSocket = new SocketIOAuthAndAccessSocket();
const messagingSocket = new SocketIOMessagingSocket();
export const findUserIdentitiesService = new FindUserIdentitiesService(
  userRepo,
);
const roomRepo = new RoomRepo(findUserIdentitiesService);
const messageRepo = new MessageRepo(findUserIdentitiesService);

// 2. Single-domain services.
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
export const verifyUserIdService = new VerifyUserIdService(userRepo);
export const getUsersContactsService = new GetUsersContactsService(
  contactsRepo,
);
export const findRoomsForUserService = new FindRoomsForUserService(roomRepo);
export const removeParticipantFromRoomService =
  new RemoveParticipantFromRoomService(roomRepo);
export const deleteRoomService = new DeleteRoomService(roomRepo);
export const deleteRoomMessagesService = new DeleteRoomMessagesService(
  messageRepo,
);
export const redactUserMessagesInRoomService =
  new RedactUserMessagesInRoomService(messageRepo);
export const findRoomMessagesService = new FindRoomMessagesService(messageRepo);
export const createMessageService = new CreateMessageService(
  messageRepo,
  messagingSocket,
);

// 3. Cross-domain services. Freely reference anything above - all one file,
// no cycle is possible because nothing here is ever imported by anything
// these services themselves depend on.
export const createNewRoomService = new CreateNewRoomService(
  verifyUserIdService,
  getUsersContactsService,
  findUserIdentitiesService,
  roomRepo,
);
export const acceptRoomInviteService = new AcceptRoomInviteService(
  roomRepo,
  authAndAccessSocket,
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
  findRoomsForUserService,
  removeParticipantFromRoomService,
  deleteRoomService,
  deleteRoomMessagesService,
  redactUserMessagesInRoomService,
);
export const deleteUserAccountService = new DeleteUserAccountService(
  userRepo,
  contactsRepo,
  authAndAccessSocket,
  findRoomsForUserService,
  removeParticipantFromRoomService,
  deleteRoomService,
  deleteRoomMessagesService,
  redactUserMessagesInRoomService,
);
export const syncUserDataService = new SyncUserDataService(
  contactsRepo,
  findRoomsForUserService,
  findRoomMessagesService,
);
export const addUserToRoomsService = new AddUserToRoomsService(
  findRoomsForUserService,
);

// 4. Controllers - built with exactly the services each one needs.
export const authControllers = new AuthControllers(
  loginService,
  registrationService,
  verifyRefreshTokenService,
  deleteUserAccountService,
);
export const contactsControllers = new ContactsControllers(
  searchUserService,
  addContactService,
  blockContactService,
);
export const syncControllers = new SyncControllers(syncUserDataService);
export const roomsControllers = new RoomsControllers(
  createNewRoomService,
  acceptRoomInviteService,
);
export const messagingControllers = new MessagingControllers(
  createMessageService,
);
