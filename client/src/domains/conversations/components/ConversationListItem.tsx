import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { useConversationListItemData } from "@/domains/conversations/hooks/useConversationListItemData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getInitials, formatMessageTime } from "@/lib/utils";
import type { RoomDTO } from "@/domains/conversations/entities/room";

const MAX_STACKED_AVATARS = 3;

export const ConversationListItem = ({
  room,
  isActive,
  onClick,
}: {
  room: RoomDTO;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const {
    isOneOnOne,
    isSelfChat,
    otherParticipants,
    isOnline,
    unreadCount,
    lastMessage,
  } = useConversationListItemData(room);
  const currentUser = useCurrentUser();

  const preview = lastMessage
    ? lastMessage.redacted
      ? "Message deleted"
      : lastMessage.text
    : "";

  const timestamp = lastMessage ? formatMessageTime(lastMessage.createdAt) : "";

  const stackedParticipants = otherParticipants.slice(0, MAX_STACKED_AVATARS);
  const overflowCount = otherParticipants.length - stackedParticipants.length;

  return (
    <li>
      <button
        type="button"
        data-active={isActive}
        onClick={onClick}
        className="hover:bg-brand/10 data-[active=true]:bg-brand/10 flex w-full min-w-0 items-center gap-2 rounded-lg p-2 text-left hover:cursor-pointer"
      >
        <div className="avatarGroup relative size-10 shrink-0">
          {isSelfChat ? (
            <Avatar className="ring-brand size-9 rounded-full ring-2">
              <AvatarFallback className="rounded-full text-xs">
                {getInitials(
                  currentUser?.firstName ?? "",
                  currentUser?.lastName ?? "",
                )}
              </AvatarFallback>
            </Avatar>
          ) : isOneOnOne ? (
            <Avatar className="ring-brand size-9 rounded-full ring-2">
              <AvatarFallback className="rounded-full text-xs">
                {getInitials(
                  otherParticipants[0]?.firstName ?? "",
                  otherParticipants[0]?.lastName ?? "",
                )}
              </AvatarFallback>
              <AvatarBadge
                className={isOnline ? "bg-green-500" : "bg-gray-400"}
              />
            </Avatar>
          ) : (
            <>
              {stackedParticipants.map((participant, index) => (
                <Avatar
                  key={participant.userId}
                  className="ring-brand absolute size-7 rounded-full ring-2"
                  style={{
                    top: `${index * 6}px`,
                    left: `${index * 6}px`,
                    zIndex: stackedParticipants.length - index,
                  }}
                >
                  <AvatarFallback className="rounded-full text-[10px]">
                    {getInitials(participant.firstName, participant.lastName)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {overflowCount > 0 && (
                <div
                  className="bg-muted ring-background text-muted-foreground absolute flex size-7 items-center justify-center rounded-full text-[10px] ring-2"
                  style={{
                    top: `${stackedParticipants.length * 6}px`,
                    left: `${stackedParticipants.length * 6}px`,
                    zIndex: 0,
                  }}
                >
                  +{overflowCount}
                </div>
              )}
            </>
          )}
        </div>
        <div className="content w-full min-w-0">
          <div className="topRow flex w-full flex-row justify-between">
            <span className="text-foreground truncate">{room.name}</span>
            <span className="text-muted-foreground text-xs">{timestamp}</span>
          </div>
          <div className="bottomRow flex w-full flex-row items-center justify-between gap-2">
            <span className="lastMessage text-muted-foreground min-w-0 flex-1 truncate text-xs">
              {preview}
            </span>
            {unreadCount > 0 && (
              <span className="bg-brand text-brand-foreground flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
};
