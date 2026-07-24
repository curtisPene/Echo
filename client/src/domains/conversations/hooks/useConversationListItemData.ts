import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { roomsRepo, getRoomMessagesService } from "@/composition";
import { usePresence } from "@/domains/presence/stores/usePresence";
import { useAuth } from "@/stores/useAuth";
import { Room, type RoomDTO } from "../entities/room";
import type { MessageDTO } from "@/domains/messaging/entities/message";

export const useConversationListItemData = (room: RoomDTO) => {
  const currentUserId = useAuth((state) => state.user?.id);
  const entity = Room.hydrate(room);

  const isOneOnOne = entity.isOneOnOne();
  const otherParticipants = currentUserId
    ? entity.getOtherParticipants(currentUserId)
    : entity.getParticipants();
  const status = currentUserId ? entity.statusFor(currentUserId) : "pending";

  const otherParticipantId = isOneOnOne ? otherParticipants[0]?.userId : undefined;
  const isOnline = usePresence((state) =>
    otherParticipantId ? (state.onlineUserIds[otherParticipantId] ?? false) : false,
  );

  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<MessageDTO | null>(null);

  useEffect(() => {
    let cancelled = false;

    roomsRepo.getUnreadCount(room.id).then((result) => {
      if (!cancelled) setUnreadCount(result?.unread ?? 0);
    });

    return () => {
      cancelled = true;
    };
  }, [room.id]);

  useEffect(() => {
    const query = getRoomMessagesService.execute({ roomId: room.id });

    const subscription = liveQuery(query).subscribe({
      next: (messages) => {
        const mostRecent = messages.reduce<MessageDTO | null>((latest, current) => {
          if (!latest) return current;
          return current.createdAt > latest.createdAt ? current : latest;
        }, null);
        setLastMessage(mostRecent);
      },
    });

    return () => subscription.unsubscribe();
  }, [room.id]);

  return {
    isOneOnOne,
    otherParticipants,
    status,
    isOnline,
    unreadCount,
    lastMessage,
  };
};
