import { ConversationListItem } from "./ConversationListItem";
import { useConversationListView } from "../hooks/useConversationListView";
import clsx from "clsx";
import { useNavRouter } from "@/app/hooks/useNavRouter";

export const ConversationsList = () => {
  const { rooms } = useConversationListView();
  const { onNavigate } = useNavRouter();

  return (
    <div className={clsx("root")}>
      <ul className={clsx("conversationList", "flex w-full flex-col gap-2")}>
        {rooms.map((room) => {
          return (
            <ConversationListItem
              key={room.id}
              room={room}
              lastMessageAt={room.lastMessageAt}
              lastMessage={room.lastMessage}
              roomAvatarInitials={room.roomAvatarInitials}
              onClick={() => {
                onNavigate("room", room);
              }}
            />
          );
        })}
      </ul>
    </div>
  );
};
