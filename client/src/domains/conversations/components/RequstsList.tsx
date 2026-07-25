import clsx from "clsx";
import { useRoomsList } from "@/domains/conversations/hooks/useRoomsList";
import { useLayoutController } from "@/app/hooks/useLayoutController";
import { useActiveRoom } from "@/stores/useActiveRoom";
import { ConversationListItem } from "@/domains/conversations/components/ConversationListItem";

export const RequestsList = () => {
  const { pendingRooms } = useRoomsList();
  const { selectConversation } = useLayoutController();
  const { activeRoom } = useActiveRoom();

  return (
    <div className={clsx("root")}>
      <ul className={clsx("requestsList", "flex w-full flex-col gap-2")}>
        {pendingRooms.map((room) => (
          <ConversationListItem
            key={room.id}
            room={room}
            isActive={activeRoom?.id === room.id}
            onClick={() => selectConversation(room)}
          />
        ))}
      </ul>
    </div>
  );
};
