import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlusIcon, LogOutIcon, BanIcon } from "lucide-react";
import clsx from "clsx";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { useAuth } from "@/stores/useAuth";
import { Room } from "@/domains/conversations/entities/room";
import type { ParticipantDTO } from "@/domains/conversations/entities/room";
import { getInitials } from "@/lib/utils";
import { useBlockContactViewModel } from "@/domains/authAndAccess/viewModels/useBlockContactViewModel";
import { useDeclineInviteViewModel } from "@/domains/conversations/viewModels/useDeclineInviteViewModel";
import { useLayoutController } from "@/app/hooks/useLayoutController";
import { MembersList } from "./MembersList";
import { BlockConfirmDialog } from "./BlockConfirmDialog";
import { AddParticipantDialog } from "./AddParticipantDialog";
import { LeaveGroupDialog } from "./LeaveGroupDialog";

export const ConversationDetailsContent = () => {
  const { activeRoom } = useActiveRoom();
  const currentUserId = useAuth((state) => state.user?.id);
  const { isConfirming, isBlocking, openConfirm, cancel, confirmBlock } =
    useBlockContactViewModel();
  const [blockTarget, setBlockTarget] = useState<ParticipantDTO | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const { isDeclining, declineInvite } = useDeclineInviteViewModel();
  const { viewConversations } = useLayoutController();

  const handleLeaveGroup = async (roomId: string) => {
    const result = await declineInvite(roomId);
    if (result.success) {
      setIsLeaveOpen(false);
      viewConversations();
    }
  };

  const toggleBlockTarget = (participant: ParticipantDTO) => {
    if (isConfirming && blockTarget?.userId === participant.userId) {
      cancel();
    } else {
      setBlockTarget(participant);
      openConfirm();
    }
  };

  if (!activeRoom || !currentUserId) return null;

  const room = Room.hydrate(activeRoom);
  const isOneOnOne = room.isOneOnOne();
  const otherParticipants = room.getOtherParticipants(currentUserId);

  const headerName = isOneOnOne
    ? `${otherParticipants[0]?.firstName ?? ""} ${otherParticipants[0]?.lastName ?? ""}`.trim()
    : activeRoom.name;

  const headerInitials = isOneOnOne
    ? getInitials(
        otherParticipants[0]?.firstName ?? "",
        otherParticipants[0]?.lastName ?? "",
      )
    : getInitials(activeRoom.name, "");

  const headerSubtitle = isOneOnOne
    ? undefined
    : `${activeRoom.participants.length} members`;

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
            {headerInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className={clsx("text-foreground", "font-semibold")}>
            {headerName}
          </h2>
          <p className={clsx("text-muted-foreground", "text-xs")}>
            {headerSubtitle}
          </p>
        </div>
      </div>

      <div
        className={clsx("detailsActions", "flex flex-row justify-center gap-6")}
      >
        <div className={clsx("detailsActionAdd", "flex flex-col items-center gap-1")}>
          <Button
            variant="outline"
            size="icon"
            aria-label="Add member"
            onClick={() => setIsAddOpen(true)}
          >
            <UserPlusIcon size={16} strokeWidth={2} />
          </Button>
          <span className={clsx("text-muted-foreground", "text-xs")}>Add</span>
        </div>
        <div className={clsx("detailsActionLeave", "flex flex-col items-center gap-1")}>
          <Button
            variant="outline"
            size="icon"
            aria-label="Leave group"
            onClick={() => setIsLeaveOpen(true)}
          >
            <LogOutIcon size={16} strokeWidth={2} />
          </Button>
          <span className={clsx("text-muted-foreground", "text-xs")}>
            Leave
          </span>
        </div>
        {isOneOnOne && otherParticipants[0] && (
          <div className={clsx("detailsActionBlock", "flex flex-col items-center gap-1")}>
            <Button
              variant="destructive"
              size="icon"
              aria-label="Block"
              onClick={() => toggleBlockTarget(otherParticipants[0])}
            >
              <BanIcon size={16} strokeWidth={2} />
            </Button>
            <span className={clsx("text-muted-foreground", "text-xs")}>
              Block
            </span>
          </div>
        )}
      </div>

      <MembersList
        participants={room.getParticipants()}
        currentUserId={currentUserId}
        onToggleBlockTarget={toggleBlockTarget}
        onOpenAddParticipant={() => setIsAddOpen(true)}
      />

      <BlockConfirmDialog
        isOpen={isConfirming}
        isBlocking={isBlocking}
        blockTarget={blockTarget}
        onCancel={cancel}
        onConfirmBlock={confirmBlock}
      />

      <AddParticipantDialog
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        roomId={activeRoom.id}
        isParticipant={(userId) => room.hasParticipant(userId)}
      />

      <LeaveGroupDialog
        isOpen={isLeaveOpen}
        isLeaving={isDeclining}
        onOpenChange={setIsLeaveOpen}
        onConfirmLeave={() => handleLeaveGroup(activeRoom.id)}
      />
    </div>
  );
};
