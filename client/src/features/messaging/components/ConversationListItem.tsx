import clsx from "clsx";
import { Avatar, AvatarGroup } from "@/components/avatar/Avatar";
import styles from "./ConversationListItem.module.css";

export type Participant = {
  firstName: string;
  lastName: string;
  online: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  participants: Participant[];
};

export const ConversationListItem = ({ convo }: { convo: Conversation }) => {
  const isGroup = convo.participants.length > 1;

  return (
    <div className={clsx(styles.root, "conversationListItem")}>
      {isGroup ? (
        <AvatarGroup participants={convo.participants.length} />
      ) : (
        <Avatar
          firstName={convo.participants[0].firstName}
          lastName={convo.participants[0].lastName}
        />
      )}
      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.name}>{convo.name}</span>
          <span className={styles.timestamp}>{convo.timestamp}</span>
        </div>
        <div className={styles.bottomRow}>
          <span className={styles.lastMessage}>{convo.lastMessage}</span>
          {convo.unread > 0 && (
            <span className={styles.unreadBadge}>{convo.unread}</span>
          )}
        </div>
      </div>
    </div>
  );
};
