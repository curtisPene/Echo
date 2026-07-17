import { FindRoomsForUserService } from "./services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "./services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "./services/DeleteRoomService";

export const findRoomsForUserService = new FindRoomsForUserService();
export const removeParticipantFromRoomService = new RemoveParticipantFromRoomService();
export const deleteRoomService = new DeleteRoomService();
