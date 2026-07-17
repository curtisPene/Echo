import type { MessageDTO } from "@/domains/messaging/types";
import type { RoomDTO, RoomUnreadCount } from "../types";
import {
  toRoomPresentation,
  type RoomPresentation,
} from "../presentation/roomPresentation";

export type RoomListEntry = RoomPresentation & {
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
};

export const getConversationListService = ({
  rooms,
  messages,
  unreadCounts,
  currentUserId,
}: {
  rooms: RoomDTO[];
  messages: MessageDTO[];
  unreadCounts: RoomUnreadCount[];
  currentUserId: string;
}): { rooms: RoomListEntry[]; pendingRooms: RoomListEntry[] } => {
  const toListEntry = (room: RoomDTO): RoomListEntry => {
    const presentation = toRoomPresentation(room, { currentUserId });

    const roomMessages = messages
      .filter((message) => message.roomId === room.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    const latest = roomMessages[0];

    const unread =
      unreadCounts.find((entry) => entry.roomId === room.id)?.unread ?? 0;

    return {
      ...presentation,
      lastMessage: latest && !latest.redacted ? latest.text : null,
      lastMessageAt: latest?.createdAt ?? null,
      unread,
    };
  };

  const entries = rooms.map(toListEntry);

  return {
    rooms: entries.filter((entry) => entry.myStatus === "accepted"),
    pendingRooms: entries.filter((entry) => entry.myStatus === "pending"),
  };
};
