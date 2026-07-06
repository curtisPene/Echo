import clsx from "clsx";
import styles from "./Composer.module.css";
import { SendIcon } from "lucide-react";
import { MessageItem } from "../messageItem/MessageItem";
import { useConversationView } from "../../hooks/useConversationView";
import { useComposer } from "../../hooks/useComposer";
import { useLayoutEffect, useRef } from "react";
export const Composer = () => {
  const { roomMessages, user } = useConversationView();
  const { inputValue, setInputValue, onSendMessage, activeRoom } =
    useComposer();

  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [roomMessages]);

  return (
    <div className={clsx(styles.root)}>
      <div className={clsx(styles.chatList, "chatList")}>
        {!activeRoom ? (
          <span className={clsx(styles.listInfo)}>Select a conversation</span>
        ) : null}
        {roomMessages?.length === 0 ? (
          <span className={clsx(styles.listInfo)}>
            Looks like this room is empty. Say hi!
          </span>
        ) : null}
        {roomMessages?.map((message) => (
          <MessageItem
            key={message.id}
            readBy={message.redacted ? [] : message.readBy}
            sender={message.sender ?? "User"}
            text={message.text ?? "Message"}
            timestamp={message.createdAt}
            currentUserId={user.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form className={clsx(styles.form)} action="" onSubmit={onSendMessage}>
        <input
          className={clsx(styles.input)}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button className={clsx(styles.sendButton)} type="submit">
          <SendIcon width={18} height={18} stroke={"var(--text-inverse)"} />
        </button>
      </form>
    </div>
  );
};
