import clsx from "clsx";
import styles from "./Composer.module.css";
import { SendIcon } from "lucide-react";
import { useMessages } from "@/stores/useMessages";
import { MessageItem } from "../messageItem/MessageItem";
import { useAuth } from "@/stores/useAuth";

export const Composer = () => {
  const { messages } = useMessages();
  const { user } = useAuth();

  if (!user) throw new Error("User not found");

  return (
    <div className={clsx(styles.root)}>
      <div className={clsx(styles.chatList)}>
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            readBy={message.redacted ? [] : message.readBy}
            sender={message.sender ?? "User"}
            text={message.text ?? "Message"}
            timestamp={message.createdAt}
            currentUserId={user.id}
          />
        ))}
      </div>
      <div className={clsx(styles.inputWrapper)}>
        <input className={clsx(styles.input)} type="text" />
        <button className={clsx(styles.sendButton)}>
          <SendIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
};
