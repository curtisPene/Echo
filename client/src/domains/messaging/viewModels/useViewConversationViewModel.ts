import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { useAuth } from "@/stores/useAuth";
import { getRoomMessagesService } from "@/composition";
import { groupMessages } from "../utils/groupMessages";
import { Room } from "@/domains/conversations/entities/room";
import { getInitials } from "@/lib/utils";
import type { MessageDTO } from "../entities/message";

const UNKNOWN_SENDER_NAME = "User";

export const useViewConversationViewModel = () => {
  const activeRoom = useActiveRoom((state) => state.activeRoom);
  const currentUserId = useAuth((state) => state.user?.id);
  const [messages, setMessages] = useState<MessageDTO[]>([]);

  useEffect(() => {
    const query = getRoomMessagesService.execute({
      roomId: activeRoom?.id ?? null,
    });

    const subscription = liveQuery(query).subscribe({
      next: setMessages,
    });

    return () => subscription.unsubscribe();
  }, [activeRoom?.id]);

  const messageListEntries = groupMessages(messages).map((entry) => {
    if (entry.kind !== "cluster") return entry;

    // A cluster's sender identity always comes from its first non-redacted
    // message - a redacted message carries no sender at all, but every
    // message in the cluster shares the same real sender by construction.
    const senderMessage = entry.messages.find((message) => !message.redacted);
    const sender =
      senderMessage && !senderMessage.redacted ? senderMessage.sender : null;

    return {
      ...entry,
      isOwnCluster: entry.senderId === currentUserId,
      senderName: sender
        ? `${sender.firstName} ${sender.lastName}`
        : UNKNOWN_SENDER_NAME,
      senderInitials: sender
        ? getInitials(sender.firstName, sender.lastName)
        : getInitials(UNKNOWN_SENDER_NAME, ""),
    };
  });

  const isPending =
    !!activeRoom &&
    !!currentUserId &&
    Room.hydrate(activeRoom).isPendingFor(currentUserId);

  return { activeRoom, messageListEntries, isPending };
};
