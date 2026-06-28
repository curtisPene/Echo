import clsx from "clsx";
import styles from "./MessageItem.module.css";
import type { MessageRead } from "../../types";

export const MessageItem = ({
  sender,
  text,
  timestamp,
  currentUserId,
}: {
  sender: string;
  text: string;
  readBy: MessageRead[];
  timestamp: string;
  currentUserId: string;
}) => {
  const mine = sender === currentUserId;

  return (
    <div className={clsx(styles.root, mine && styles.mine)}>
      <div className={styles.contentWrapper}>
        <div className={clsx(styles.bubble, mine && styles.mine)}>{text}</div>
        <span className={clsx(styles.timestamp, mine && styles.mine)}>
          {timestamp}
        </span>
      </div>
    </div>
  );
};
