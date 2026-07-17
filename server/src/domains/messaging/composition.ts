import { FindRoomMessagesService } from "./services/FindRoomMessagesService";
import { DeleteRoomMessagesService } from "./services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "./services/RedactUserMessagesInRoomService";

export const findRoomMessagesService = new FindRoomMessagesService();
export const deleteRoomMessagesService = new DeleteRoomMessagesService();
export const redactUserMessagesInRoomService = new RedactUserMessagesInRoomService();
