import type { RoomDTO } from "./entities/room";

export const RoomEvents = {
  UPDATED: "room:updated",
  DELETED: "room:deleted",
} as const;

export interface ConversationsServerToClientEvents {
  [RoomEvents.UPDATED]: (payload: { room: RoomDTO }) => void;
  [RoomEvents.DELETED]: (payload: { roomId: string }) => void;
}
