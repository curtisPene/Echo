import type { Room } from "@/domains/presence/types";
import {
  toRoomPresentation,
  type RoomPresentation,
} from "../presentation/roomPresentation";

export const getConversationDetailsService = ({
  rooms,
  activeRoomId,
  currentUserId,
}: {
  rooms: Room[];
  activeRoomId: string | null;
  currentUserId: string;
}): RoomPresentation | null => {
  const room = activeRoomId
    ? (rooms.find((room) => room.id === activeRoomId) ?? null)
    : null;

  return room ? toRoomPresentation(room, { currentUserId }) : null;
};
