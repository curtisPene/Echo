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
import { UserPlusIcon, BanIcon, ChevronDownIcon, MoreVerticalIcon } from "lucide-react";
import clsx from "clsx";
import { getInitials } from "@/lib/utils";
import type { ParticipantDTO } from "@/domains/conversations/entities/room";

export const MembersList = ({
  participants,
  currentUserId,
  onToggleBlockTarget,
  onOpenAddParticipant,
}: {
  participants: ParticipantDTO[];
  currentUserId: string;
  onToggleBlockTarget: (participant: ParticipantDTO) => void;
  onOpenAddParticipant: () => void;
}) => {
  return (
    <div className={clsx("membersSection", "flex flex-col gap-2")}>
      <Collapsible defaultOpen>
        <CollapsibleTrigger
          className={clsx(
            "membersSectionTrigger",
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
            <ul className={clsx("membersListItems", "flex flex-col gap-1 pt-1")}>
              {participants.map((participant) => (
                <li key={participant.userId} className={clsx("memberRow", "flex flex-col")}>
                  <div
                    className={clsx(
                      "memberRowContent",
                      "hover:bg-brand/10",
                      "flex items-center gap-2 rounded-lg p-2",
                    )}
                  >
                    <Avatar className={clsx("ring-brand", "size-8 rounded-full ring-2")}>
                      <AvatarFallback className={clsx("text-xs")}>
                        {getInitials(participant.firstName, participant.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={clsx("text-foreground", "flex-1 text-sm")}>
                      {participant.firstName} {participant.lastName}
                    </span>
                    {participant.userId !== currentUserId && (
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
                            onClick={() => onToggleBlockTarget(participant)}
                          >
                            <BanIcon size={16} strokeWidth={2} />
                            Block
                          </Button>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className={clsx("addMemberButton", "mt-1 w-full justify-start gap-2")}
              onClick={onOpenAddParticipant}
            >
              <UserPlusIcon size={16} strokeWidth={2} />
              Add people to the chat
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
