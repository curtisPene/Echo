import clsx from "clsx";
import styles from "./ConversationList.module.css";
import { ConversationListItem } from "../conversationListItem/ConversationListItem";
import { ConversationsHeader } from "../conversationsHeader/ConversationsHeader";
import { useConversationListView } from "../../hooks/useConversationListView";
import { useRooms } from "@/stores/useRooms";

export const ConversationList = () => {
  const { rooms, pendingRooms } = useConversationListView();
  const setACtiveRoom = useRooms((state) => state.setACtiveRoom);

  return (
    <div className={clsx(styles.root, "conversationList")}>
      <ConversationsHeader />
      {rooms.map((room) => (
        <ConversationListItem
          key={room.id}
          room={room}
          onClick={() => {
            setACtiveRoom(room.id, room.name);
          }}
        />
      ))}
      <div className={clsx(styles.pendingHeader)}>
        <span>Requests</span>
      </div>
      {pendingRooms.map((room) => (
        <ConversationListItem
          key={room.id}
          room={room}
          onClick={() => {
            setACtiveRoom(room.id, room.name);
          }}
        />
      ))}
    </div>
  );
};
