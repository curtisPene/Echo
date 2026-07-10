import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export type ConversationListItemParticipant = {
  firstName: string;
  lastName: string;
};

export type ConversationListItemRoom = {
  id: string;
  name: string;
  participants: ConversationListItemParticipant[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
};

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
  isActive,
  onClick,
}: {
  room: ConversationListItemRoom;
  isActive?: boolean;
  onClick: (room: ConversationListItemRoom) => void;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        isActive={isActive}
        onClick={() => onClick(room)}
      >
        <div className="avatarGroup relative size-9 shrink-0">
          <Avatar className="absolute top-0 left-0 size-7 rounded-full ring-2 ring-sidebar">
            <AvatarFallback className="rounded-full text-xs" />
          </Avatar>
          <Avatar className="absolute right-0 bottom-0 size-6 rounded-full ring-2 ring-sidebar">
            <AvatarFallback className="rounded-full text-xs" />
          </Avatar>
        </div>
        <div className="content w-full">
          <div className="topRow flex flex-row justify-between">
            <span className="text-foreground font-semibold">Room Name</span>
            <span className="text-muted-foreground text-xs">
              {formatTimestamp(room.lastMessageAt || "")}
            </span>
          </div>
          <div className="bottomRow flex flex-row justify-between items-center w-full">
            <span className="lastMessage text-muted-foreground">
              How's it going?
            </span>
            <div className="unreadCountBadge flex items-center justify-center size-5 rounded-full bg-primary relative">
              <span className="unreadCountText text-white text-xs leading-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                2
              </span>
            </div>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
