import { ConversationListItem } from "./ConversationListItem";
import { useConversationListView } from "../hooks/useConversationListView";
import clsx from "clsx";
import { useRooms } from "@/stores/useRooms";

export const ConversationsList = () => {
  const { rooms } = useConversationListView();
  const { setACtiveRoom } = useRooms();

  return (
    <div className={clsx("root")}>
      <div
        className={clsx(
          "conversationListHeader",
          "border-border mb-3 block border-b px-1 pb-3 sm:hidden",
        )}
      >
        <h1 className="text-foreground text-xl font-semibold">Chats</h1>
      </div>
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
                setACtiveRoom(room.id, room.name);
              }}
            />
          );
        })}
      </ul>
    </div>
  );
};
