import clsx from "clsx";
import styles from "./ConversationList.module.css";
import { useRooms } from "@/stores/useRooms";
import { ConversationListItem } from "../conversationListItem/ConversationListItem";
import { ConversationsHeader } from "../conversationsHeader/ConversationsHeader";

export const ConversationList = () => {
  const { rooms, setACtiveRoom } = useRooms();

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
    </div>
  );
};
