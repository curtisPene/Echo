import type { Room } from "@/features/rooms/types";
import { useAuth } from "@/stores/useAuth";
import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";
import { useRoomUnreadCounts } from "@/stores/useRoomUnreadCounts";

export const useConversationListView = () => {
  const rooms = useRooms((state) => state.rooms);
  const messages = useMessages((state) => state.messages);
  const unreadCounts = useRoomUnreadCounts((state) => state.unreadCounts);
  const userId = useAuth((state) => state.user?.id);

  const myStatus = (room: Room) =>
    room.participants.find((participant) => participant.user.id === userId)
      ?.status;

  const withView = (room: Room) => {
    const roomMessages = messages
      .filter((message) => message.room === room.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    const latest = roomMessages[0];

    const unread =
      unreadCounts.find((entry) => entry.roomId === room.id)?.unread ?? 0;

    return {
      ...room,
      lastMessage: latest && !latest.redacted ? latest.text : null,
      lastMessageAt: latest?.createdAt ?? null,
      unread,
    };
  };

  const pendingRooms = rooms
    .filter((room) => myStatus(room) === "pending")
    .map(withView);
  const acceptedRooms = rooms
    .filter((room) => myStatus(room) === "accepted")
    .map(withView);

  return { rooms: acceptedRooms, pendingRooms };
};
