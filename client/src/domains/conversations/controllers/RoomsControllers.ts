import { useRooms } from "@/stores/useRooms";
import type { AcceptRequestService } from "../services/acceptRequestService";
import type { CreateNewRoomService } from "../services/createNewRoomService";
import type { User } from "@/domains/authAndAccess/domainModels/user";
import type { ContactDTO } from "@/domains/authAndAccess/domainModels/contacts";
import type { RoomDTO } from "../domainModels/room";

export type AcceptRequestControllerResult =
  | { success: true }
  | { success: false; message: string };

export type CreateNewRoomControllerResult =
  | { success: true; roomId: string; name: string }
  | { success: false; message: string };

export class RoomsControllers {
  private readonly acceptRequestService: AcceptRequestService;
  private readonly createNewRoomService: CreateNewRoomService;

  constructor(acceptRequestService: AcceptRequestService, createNewRoomService: CreateNewRoomService) {
    this.acceptRequestService = acceptRequestService;
    this.createNewRoomService = createNewRoomService;
  }

  acceptRequest = async ({
    roomId,
  }: {
    roomId: string;
  }): Promise<AcceptRequestControllerResult> => {
    const result = await this.acceptRequestService.execute({ roomId });

    if (!result.success) {
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
      return { success: false, message: result.message };
    }

    this.selectRoom(result.data);

    return { success: true, roomId: result.data.id, name: result.data.name };
  };

  selectRoom = (room: RoomDTO) => {
    useRooms.getState().setActiveRoom(room);
  };

  clearActiveRoom = () => {
    useRooms.getState().clearActiveRoom();
  };
}
