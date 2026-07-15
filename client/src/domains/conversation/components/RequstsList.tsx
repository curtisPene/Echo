import clsx from "clsx";
import { useConversationListViewModel } from "../viewModels/useConversationListViewModel";
import { ConversationListItem } from "./ConversationListItem";

export const RequestsList = () => {
  const { pendingRooms, selectRoom } = useConversationListViewModel();

  return (
    <div className={clsx("root")}>
      <ul className={clsx("requestsList", "flex w-full flex-col gap-2")}>
        {pendingRooms.map((room) => {
          return (
            <ConversationListItem
              key={room.id}
              room={room}
              isActive={false}
              onClick={() => {
                selectRoom(room.id, room.name);
              }}
            />
          );
        })}
      </ul>
    </div>
  );
};
