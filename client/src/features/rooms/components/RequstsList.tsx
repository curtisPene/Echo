import clsx from "clsx";
import { useRooms } from "@/stores/useRooms";
import { useConversationListView } from "../hooks/useConversationListView";
import { ConversationListItem } from "./ConversationListItem";

export const RequestsList = () => {
  const { pendingRooms } = useConversationListView();
  const { setACtiveRoom } = useRooms();

  return (
    <div className={clsx("root")}>
      <div
        className={clsx(
          "requestsListHeader",
          "border-border block border-b px-1 pb-3 sm:hidden",
        )}
      >
        <h1 className="text-foreground text-xl font-semibold">Requests</h1>
      </div>
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
    </div>
  );
};
