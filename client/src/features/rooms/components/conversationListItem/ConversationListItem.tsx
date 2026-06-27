import clsx from "clsx";
import { Avatar, AvatarGroup } from "@/components/avatar/Avatar";
import styles from "./ConversationListItem.module.css";
import type { Room } from "../../types";

export const ConversationListItem = ({ room }: { room: Room } & {}) => {
  const isGroup = room.participants.length > 1;

  return (
    <div className={clsx(styles.root, "conversationListItem")}>
      {isGroup ? (
        <AvatarGroup participants={room.participants.length} />
      ) : (
        <Avatar
          firstName={room.participants[0].user.firstName}
          lastName={room.participants[0].user.lastName}
        />
      )}
      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.name}>{room.name}</span>
          <span className={styles.timestamp}>{room.lastMessageAt}</span>
        </div>
        <div className={styles.bottomRow}>
          <span className={styles.lastMessage}>{room.lastMessage}</span>
          {room.unread > 0 && (
            <span className={styles.unreadBadge}>{room.unread}</span>
          )}
        </div>
      </div>
    </div>
  );
};
