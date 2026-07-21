import clsx from "clsx";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";

export const MobileChatScreen = () => {
  return (
    <div className={clsx("mobileChatScreen", "flex h-full min-h-0 flex-col")}>
      <div className={clsx("messagesPanel", "min-h-0 flex-1")}>
        <MessageList />
      </div>
      <Composer />
    </div>
  );
};
