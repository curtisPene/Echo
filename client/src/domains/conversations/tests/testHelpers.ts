import { AcceptRequestService } from "../services/acceptRequestService";
import { CreateNewRoomService } from "../services/createNewRoomService";
import { AddParticipantToRoomService } from "../services/addParticipantToRoomService";
import { RenameRoomService } from "../services/renameRoomService";
import { RoomsControllers } from "../controllers/RoomsControllers";
import { DexieRoomsRepo } from "../adapters/DexieRoomsRepo";
import { User } from "@/domains/authAndAccess/entities/user";
import { Room } from "../entities/room";
import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";
import type { RoomsApi } from "../ports/RoomsApi";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

export function createFakeNotificationsPort(): NotificationsPort {
  return { notify: () => {} };
}

export const CURRENT_USER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

export const CONTACT: ContactDTO = {
  userId: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
};

export const UPDATED_ROOM = Room.hydrate({
  id: "room-1",
  name: "Ada, Grace",
  participants: [
    {
      userId: CURRENT_USER.id,
      firstName: "Ada",
      lastName: "Lovelace",
      email: CURRENT_USER.email,
      status: "accepted",
    },
    {
      userId: CONTACT.userId,
      firstName: "Grace",
      lastName: "Hopper",
      email: CONTACT.email,
      status: "accepted",
    },
  ],
});

export function createFakeRoomsApi(overrides: Partial<RoomsApi> = {}): RoomsApi {
  return {
    async create() {
      return {
        success: true,
        message: "Room created successfully",
        data: Room.hydrate({
          id: "room-2",
          name: "New Room",
          participants: [
            {
              userId: CURRENT_USER.id,
              firstName: "Ada",
              lastName: "Lovelace",
              email: CURRENT_USER.email,
              status: "accepted",
            },
            {
              userId: CONTACT.userId,
              firstName: "Grace",
              lastName: "Hopper",
              email: CONTACT.email,
              status: "pending",
            },
          ],
        }),
      };
    },
    async acceptInvite() {
      return {
        success: true,
        message: "Request accepted successfully",
        data: { roomDeleted: false, room: UPDATED_ROOM },
      };
    },
    async addParticipant() {
      return {
        success: true,
        message: "Participant added successfully",
        data: UPDATED_ROOM,
      };
    },
    async rename() {
      return {
        success: true,
        message: "Room renamed successfully",
        data: UPDATED_ROOM,
      };
    },
    ...overrides,
  };
}

export function createRoomsControllers(roomsApi: RoomsApi) {
  const roomsRepo = new DexieRoomsRepo();
  return new RoomsControllers(
    new AcceptRequestService(roomsApi, roomsRepo),
    new CreateNewRoomService(roomsApi, roomsRepo),
    new AddParticipantToRoomService(roomsApi, roomsRepo),
    new RenameRoomService(roomsApi, roomsRepo),
    createFakeNotificationsPort(),
  );
}
