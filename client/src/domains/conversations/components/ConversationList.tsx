import { useConversationListViewModel } from "../viewModels/useConversationListViewModel";
import { ConversationListItem } from "./ConversationListItem";
import clsx from "clsx";

export const ConversationsList = () => {
  const { rooms, selectRoom } = useConversationListViewModel();

  return (
    <div className={clsx("root")}>
      <ul className={clsx("conversationList", "flex w-full flex-col gap-2")}>
        {rooms.map((room) => {
          return (
            <ConversationListItem
              key={room.id}
              room={room}
              onClick={() => {
                selectRoom(room);
              }}
            />
          );
        })}
      </ul>
    </div>
  );
};
