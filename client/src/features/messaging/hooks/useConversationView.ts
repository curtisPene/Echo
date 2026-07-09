import { useAuth } from "@/stores/useAuth";
import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";

export const useConversationView = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const rooms = useRooms((state) => state.rooms);
  const messages = useMessages((state) => state.messages);
  const { user } = useAuth();

  if (!user) throw new Error("User not found");

  const activeRoomData = activeRoom
    ? rooms.find((room) => room.id === activeRoom.id)
    : null;

  const isRoomAccepted = activeRoomData?.participants.find(
    (participant) => participant.user.id === user.id,
  )?.status === "accepted";

  const roomMessages = activeRoom
    ? messages.filter((message) => message.room === activeRoom.id)
    : null;

  return { roomMessages, user, activeRoom, isRoomAccepted };
};
