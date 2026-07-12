import clsx from "clsx";
import { useRooms } from "@/stores/useRooms";
import { useConversationListView } from "../hooks/useConversationListView";
import { ConversationListItem } from "./ConversationListItem";

export const RequestsList = () => {
  const { pendingRooms } = useConversationListView();
  const { setACtiveRoom } = useRooms();

  return (
    <div className={clsx("root")}>
      <ul>
        {pendingRooms.map((room) => {
          return (
            <ConversationListItem
              key={room.id}
              room={room}
              lastMessage={room.lastMessage}
              lastMessageAt={room.lastMessageAt}
              roomAvatarInitials={room.roomAvatarInitials}
              isActive={false}
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
