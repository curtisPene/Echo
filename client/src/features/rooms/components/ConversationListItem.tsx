import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Room } from "../types";

const formatTimestamp = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
};

export const ConversationListItem = ({
  room,
  lastMessage,
  lastMessageAt,
  isActive,
  onClick,
}: {
  room: Room;
  lastMessage: string | null;
  lastMessageAt: string;
  isActive?: boolean;
  onClick: (room: Room) => void;
}) => {
  return (
    <li>
      <button
        type="button"
        data-active={isActive}
        onClick={() => onClick(room)}
        className="hover:bg-brand/10 data-[active=true]:bg-brand/10 flex w-full min-w-40 items-center gap-2 rounded-lg p-2 text-left"
      >
        <div className="avatarGroup relative size-9 shrink-0">
          <Avatar className="ring-brand absolute top-0 left-0 size-7 rounded-full ring-2">
            <AvatarFallback className="rounded-full text-xs" />
          </Avatar>
          <Avatar className="ring-brand absolute right-0 bottom-0 size-6 rounded-full ring-2">
            <AvatarFallback className="rounded-full text-xs" />
          </Avatar>
        </div>
        <div className="content w-full">
          <div className="topRow flex w-full flex-row justify-between">
            <span className="text-foreground truncate">{room.name}</span>
            <span className="text-muted-foreground text-xs">
              {formatTimestamp(lastMessageAt || "")}
            </span>
          </div>
          <div className="bottomRow flex w-full flex-row items-center justify-between">
            <span className="lastMessage text-muted-foreground truncate text-xs">
              {lastMessage || "No messages yet"}
            </span>
            <div className="unreadCountBadge bg-brand relative flex size-5 items-center justify-center rounded-full">
              <span className="unreadCountText text-brand-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs leading-none">
                2
              </span>
            </div>
          </div>
        </div>
      </button>
    </li>
  );
};
