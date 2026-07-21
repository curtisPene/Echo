import { HttpAuthApi } from "./domains/authAndAccess/adapters/HttpAuthApi";
import { HttpContactsApi } from "./domains/authAndAccess/adapters/HttpContactsApi";
import { DexieContactsRepo } from "./domains/authAndAccess/adapters/DexieContactsRepo";
import { DexieRoomsRepo } from "./domains/conversations/adapters/DexieRoomsRepo";
import { HttpRoomsApi } from "./domains/conversations/adapters/HttpRoomsApi";
import { DexieMessagesRepo } from "./domains/messaging/adapters/DexieMessagesRepo";
import { SocketIOMessagingSocketApi } from "./domains/messaging/adapters/SocketIOMessagingSocketApi";

import { LoginService } from "./domains/authAndAccess/services/LoginService";
import { RegistrationService } from "./domains/authAndAccess/services/RegistrationService";
import { VerificationService } from "./domains/authAndAccess/services/VerificationService";
import { GetContactsService } from "./domains/authAndAccess/services/GetContactsService";
import { AddContactService } from "./domains/authAndAccess/services/AddContactService";
import { AcceptRequestService } from "./domains/conversations/services/acceptRequestService";
import { CreateNewRoomService } from "./domains/conversations/services/createNewRoomService";
import { GetRoomsService } from "./domains/conversations/services/getRoomsService";
import { HasPendingRequestsService } from "./domains/conversations/services/hasPendingRequestsService";
import { GetConversationDetailsService } from "./domains/conversations/services/getConversationDetailsService";
import { GetMessagesService } from "./domains/messaging/services/getMessagesService";
import { GetRoomMessagesService } from "./domains/messaging/services/getRoomMessagesService";
import { MessageReceiveService } from "./domains/messaging/services/messageReceiveService";
import { SendMessageService } from "./domains/messaging/services/sendMessageService";

import { AuthControllers } from "./domains/authAndAccess/controllers/AuthControllers";
import { ContactsControllers } from "./domains/authAndAccess/controllers/ContactsControllers";
import { RoomsControllers } from "./domains/conversations/controllers/RoomsControllers";
import { MessagingControllers } from "./domains/messaging/controllers/MessagingControllers";

// 1. Adapters - the leaves, no dependencies on any service.
const authApi = new HttpAuthApi();
const contactsApi = new HttpContactsApi();
export const contactsRepo = new DexieContactsRepo();
export const roomsRepo = new DexieRoomsRepo();
export const roomsApi = new HttpRoomsApi();
export const messagesRepo = new DexieMessagesRepo();
export const messagingSocketApi = new SocketIOMessagingSocketApi();

// 2. Services - built with exactly the adapters/services each one needs.
export const loginService = new LoginService(authApi);
export const registrationService = new RegistrationService(authApi);
export const verificationService = new VerificationService(authApi);
export const getContactsService = new GetContactsService(contactsRepo);
export const addContactService = new AddContactService(
  contactsApi,
  contactsRepo,
  roomsRepo,
);
export const acceptRequestService = new AcceptRequestService(
  roomsApi,
  roomsRepo,
);
export const createNewRoomService = new CreateNewRoomService(
  roomsApi,
  roomsRepo,
);
export const getRoomsService = new GetRoomsService(roomsRepo);
export const hasPendingRequestsService = new HasPendingRequestsService();
export const getConversationDetailsService =
  new GetConversationDetailsService();
export const getMessagesService = new GetMessagesService(messagesRepo);
export const getRoomMessagesService = new GetRoomMessagesService();
export const messageReceiveService = new MessageReceiveService(messagesRepo);
export const sendMessageService = new SendMessageService(
  messagingSocketApi,
  messagesRepo,
);

// 3. Controllers - built with exactly the services each one needs.
export const authControllers = new AuthControllers(
  loginService,
  registrationService,
);
export const contactsControllers = new ContactsControllers(addContactService);
export const roomsControllers = new RoomsControllers(
  acceptRequestService,
  createNewRoomService,
);
export const messagingControllers = new MessagingControllers(
  sendMessageService,
  messageReceiveService,
);
