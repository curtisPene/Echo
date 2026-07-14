import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";

export const useConversationDetailsView = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const rooms = useRooms((state) => state.rooms);
  const user = useAuth((state) => state.user);

  const room = activeRoom
    ? (rooms.find((room) => room.id === activeRoom.id) ?? null)
    : null;

  const initials = room
    ? room.participants
        .map((participant) => participant.user.firstName[0])
        .join("")
    : null;

  const isOneOnOne = room?.participants.length === 2;

  const isRoomPending = room?.participants.some((participant) => {
    return participant.user.id === user?.id && participant.status === "pending";
  });

  return { room, initials, isOneOnOne, isRoomPending };
};
