import { ConversationListItem } from "./ConversationListItem";
import { useConversationListView } from "../hooks/useConversationListView";
import clsx from "clsx";
import { useRooms } from "@/stores/useRooms";

export const ConversationsList = () => {
  const { rooms } = useConversationListView();
  const { setACtiveRoom } = useRooms();

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
