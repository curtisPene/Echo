import type { Room } from "@/features/rooms/types";
import { useAuth } from "@/stores/useAuth";
import { useMessages } from "@/stores/useMessages";
import { useRooms } from "@/stores/useRooms";
import { useRoomUnreadCounts } from "@/stores/useRoomUnreadCounts";

export const useConversationListView = () => {
  const rooms = useRooms((state) => state.rooms);
  const messages = useMessages((state) => state.messages);
  const unreadCounts = useRoomUnreadCounts((state) => state.unreadCounts);
  const user = useAuth((state) => state.user);

  const myStatus = (room: Room) =>
    room.participants.find((participant) => participant.user.id === user?.id)
      ?.status;

  const roomInitials = (room: Room) => {
    const otherParticipants = room.participants.filter(
      (participant) => participant.user.id !== user?.id,
    );

    let initials1 = `${user?.firstName[0]}${user?.lastName[0]}`;
    let initials2 = `${otherParticipants[0].user.firstName[0]}${otherParticipants[0].user.lastName[0]}`;

    if (otherParticipants.length > 1) {
      initials1 = `${otherParticipants[0].user.firstName[0]}${otherParticipants[0].user.lastName[0]}`;
      initials2 = `${otherParticipants[1].user.firstName[0]}${otherParticipants[1].user.lastName[0]}`;
    }

    return [initials1, initials2];
  };

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

    const avatarInitials = roomInitials(room);

    return {
      ...room,
      lastMessage: latest && !latest.redacted ? latest.text : null,
      lastMessageAt: latest?.createdAt ?? null,
      roomAvatarInitials: avatarInitials,
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
