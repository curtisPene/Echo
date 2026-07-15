import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  UserPlusIcon,
  LogOutIcon,
  BanIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { useConversationDetailsView } from "../hooks/useConversationDetailsView";
import clsx from "clsx";

export const ConversationDetailsContent = () => {
  const { room, initials, isOneOnOne, isRoomPending } =
    useConversationDetailsView();

  if (!room) return null;

  return (
    <div className={clsx("root", "flex flex-col gap-4 p-4")}>
      <div
        className={clsx(
          "detailsHeader",
          "flex flex-col items-center gap-2 pt-2 text-center",
        )}
      >
        <Avatar
          size="lg"
          className={clsx("ring-brand", "size-16 rounded-full ring-2")}
        >
          <AvatarFallback className={clsx("text-lg")}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className={clsx("text-foreground", "font-semibold")}>
            {room.name}
          </h2>
          <p className={clsx("text-muted-foreground", "text-xs")}>
            {room.participants.length} members
          </p>
        </div>
      </div>

      <div
        className={clsx("detailsActions", "flex flex-row justify-center gap-3")}
      >
        <Button variant="outline" size="icon" aria-label="Add member">
          <UserPlusIcon size={16} strokeWidth={2} />
        </Button>
        <Button variant="outline" size="icon" aria-label="Leave group">
          <LogOutIcon size={16} strokeWidth={2} />
        </Button>
        {isOneOnOne && (
          <Button variant="destructive" size="icon" aria-label="Block">
            <BanIcon size={16} strokeWidth={2} />
          </Button>
        )}
      </div>

      <div className={clsx("membersSection", "flex flex-col gap-2")}>
        <Collapsible defaultOpen>
          <CollapsibleTrigger
            className={clsx(
              "text-muted-foreground hover:text-foreground group",
              "mb-2 flex w-full items-center justify-between px-1 text-xs font-medium tracking-wide uppercase",
            )}
          >
            Members
            <ChevronDownIcon
              size={14}
              strokeWidth={2}
              className={clsx(
                "transition-transform group-data-panel-open:rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={clsx("membersList", "flex flex-col gap-2")}>
              <ul className={clsx("flex flex-col gap-1 pt-1")}>
                {room.participants.map((participant) => (
                  <li
                    key={participant.user.id}
                    className={clsx(
                      "hover:bg-brand/10",
                      "flex items-center gap-2 rounded-lg p-2",
                    )}
                  >
                    <Avatar
                      className={clsx(
                        "ring-brand",
                        "size-8 rounded-full ring-2",
                      )}
                    >
                      <AvatarFallback className={clsx("text-xs")}>
                        {participant.user.firstName[0]}
                        {participant.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={clsx("text-foreground", "flex-1 text-sm")}
                    >
                      {participant.user.firstName} {participant.user.lastName}
                    </span>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Member options"
                          />
                        }
                      >
                        <MoreVerticalIcon size={16} strokeWidth={2} />
                      </PopoverTrigger>
                      <PopoverContent align="end" className={clsx("w-auto p-1")}>
                        <Button
                          variant="destructive"
                          className={clsx(
                            "blockMemberButton",
                            "w-full justify-start gap-2",
                          )}
                        >
                          <BanIcon size={16} strokeWidth={2} />
                          Block
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                disabled={isRoomPending}
                className={clsx(
                  "addMemberButton",
                  "mt-1 w-full justify-start gap-2",
                )}
              >
                <UserPlusIcon size={16} strokeWidth={2} />
                Add people to the chat
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
