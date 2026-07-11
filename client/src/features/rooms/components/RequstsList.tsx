import { useRooms } from "@/stores/useRooms";
import { useConversationListView } from "../hooks/useConversationListView";
import { ConversationListItem } from "./ConversationListItem";

export const RequestsList = () => {
  const { pendingRooms } = useConversationListView();
  const { setACtiveRoom } = useRooms();

  return (
    <ul>
      {pendingRooms.map((room) => {
        return (
          <ConversationListItem
            key={room.id}
            room={room}
            lastMessage={room.lastMessage}
            lastMessageAt={room.lastMessageAt}
            isActive={false}
            onClick={() => {
              setACtiveRoom(room.id, room.name);
            }}
          />
        );
      })}
    </ul>
  );
};
