import clsx from "clsx";
import { Avatar, AvatarGroup } from "@/components/avatar/Avatar";
import styles from "./ConversationListItem.module.css";
import type { Room } from "../../types";

type ConversationListItemRoom = Room & {
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
};

export const ConversationListItem = ({
  room,
  onClick,
}: {
  room: ConversationListItemRoom;
  onClick: () => void;
}) => {
  const isGroup = room.participants.length > 1;

  return (
    <div onClick={onClick} className={clsx(styles.root)}>
      {isGroup ? (
        <AvatarGroup participants={room.participants} />
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
