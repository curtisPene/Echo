import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { Contact } from "@/features/contacts/types";

const formatLastSeen = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

export const ContactsListItem = ({
  contact,
  onClick,
  lastSeenAt,
  online,
}: {
  contact: Contact;
  lastSeenAt: string;
  online: boolean;
  onClick: (contact: Contact) => void;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" onClick={() => onClick(contact)}>
        <div className="avatarGroup relative size-9 shrink-0">
          <Avatar className="size-9 rounded-full">
            <AvatarFallback className="rounded-full text-xs">
              {contact.firstName.charAt(0)}
              {contact.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <AvatarBadge
            className={online ? "bg-green-500" : "bg-muted-foreground/50"}
          />
        </div>
        <div className="content w-full leading-tight">
          <div className="topRow flex flex-row justify-between">
            <span className="text-foreground font-semibold">{`${contact.firstName} ${contact.lastName}`}</span>
          </div>
          <div className="bottomRow">
            <span className="lastSeen text-xs text-muted-foreground">
              Last seen {formatLastSeen(lastSeenAt)}
            </span>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
