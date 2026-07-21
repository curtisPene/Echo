import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const ConversationListItem = ({
  isActive,
  onClick,
}: {
  isActive?: boolean;
  onClick?: () => void;
}) => {
  return (
    <li>
      <button
        type="button"
        data-active={isActive}
        onClick={onClick}
        className="hover:bg-brand/10 data-[active=true]:bg-brand/10 flex w-full min-w-0 items-center gap-2 rounded-lg p-2 text-left"
      >
        <div className="avatarGroup relative size-9 shrink-0">
          <Avatar className="ring-brand absolute top-0 left-0 size-7 rounded-full ring-2">
            <AvatarFallback className="rounded-full text-xs"></AvatarFallback>
          </Avatar>
        </div>
        <div className="content w-full min-w-0">
          <div className="topRow flex w-full flex-row justify-between">
            <span className="text-foreground truncate"></span>
            <span className="text-muted-foreground text-xs"></span>
          </div>
          <div className="bottomRow flex w-full flex-row items-center justify-between">
            <span className="lastMessage text-muted-foreground truncate text-xs"></span>
          </div>
        </div>
      </button>
    </li>
  );
};
