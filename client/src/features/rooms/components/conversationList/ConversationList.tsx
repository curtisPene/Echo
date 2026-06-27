import clsx from "clsx";
import styles from "./ConversationList.module.css";
import { useRooms } from "@/stores/useRooms";
import { ConversationListItem } from "../conversationListItem/ConversationListItem";

export const ConversationList = () => {
  const { rooms } = useRooms();
  return (
    <div className={clsx(styles.root, "conversationList")}>
      {rooms.map((room) => (
        <ConversationListItem key={room.id} room={room} />
      ))}
    </div>
  );
};
