import { useActiveRoom } from "@/stores/useActiveRoom";
import type { AcceptRequestService } from "../services/acceptRequestService";
import type { CreateNewRoomService } from "../services/createNewRoomService";
import type { AddParticipantToRoomService } from "../services/addParticipantToRoomService";
import type { RenameRoomService } from "../services/renameRoomService";
import type { User } from "@/domains/authAndAccess/entities/user";
import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";
import type { RoomDTO } from "../entities/room";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

export type AcceptRequestControllerResult =
  { success: true } | { success: false; message: string };

export type CreateNewRoomControllerResult =
  | { success: true; roomId: string; name: string }
  | { success: false; message: string };

export type AddParticipantControllerResult =
  { success: true } | { success: false; message: string };

export type RenameRoomControllerResult =
  { success: true } | { success: false; message: string };

export class RoomsControllers {
  private readonly acceptRequestService: AcceptRequestService;
  private readonly createNewRoomService: CreateNewRoomService;
  private readonly addParticipantToRoomService: AddParticipantToRoomService;
  private readonly renameRoomService: RenameRoomService;
  private readonly notificationsPort: NotificationsPort;

  constructor(
    acceptRequestService: AcceptRequestService,
    createNewRoomService: CreateNewRoomService,
    addParticipantToRoomService: AddParticipantToRoomService,
    renameRoomService: RenameRoomService,
    notificationsPort: NotificationsPort,
  ) {
    this.acceptRequestService = acceptRequestService;
    this.createNewRoomService = createNewRoomService;
    this.addParticipantToRoomService = addParticipantToRoomService;
    this.renameRoomService = renameRoomService;
    this.notificationsPort = notificationsPort;
  }

  acceptRequest = async ({
    roomId,
    isAcceptRequest,
  }: {
    roomId: string;
    isAcceptRequest: boolean;
  }): Promise<AcceptRequestControllerResult> => {
    const result = await this.acceptRequestService.execute({
      roomId,
      isAcceptRequest,
    });

    if (!result.success) {
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    return { success: true };
  };

  createRoom = async ({
    user,
    contacts,
  }: {
    user: User;
    contacts: ContactDTO[];
  }): Promise<CreateNewRoomControllerResult> => {
    const result = await this.createNewRoomService.execute({ user, contacts });

    if (!result.success || !result.data) {
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    this.selectRoom(result.data);

    return { success: true, roomId: result.data.id, name: result.data.name };
  };

  addParticipant = async ({
    roomId,
    participantId,
  }: {
    roomId: string;
    participantId: string;
  }): Promise<AddParticipantControllerResult> => {
    const result = await this.addParticipantToRoomService.execute({
      roomId,
      participantId,
    });

    if (!result.success) {
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    return { success: true };
  };

  renameRoom = async ({
    roomId,
    name,
  }: {
    roomId: string;
    name: string;
  }): Promise<RenameRoomControllerResult> => {
    const result = await this.renameRoomService.execute({ roomId, name });

    if (!result.success) {
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    return { success: true };
  };

  selectRoom = (room: RoomDTO) => {
    useActiveRoom.getState().setActiveRoom(room);
  };

  clearActiveRoom = () => {
    useActiveRoom.getState().clearActiveRoom();
  };
}
