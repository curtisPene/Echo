import clsx from "clsx";
import { useRooms } from "@/stores/useRooms";
import { ConversationsList } from "@/domains/conversations/components/ConversationList";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";

export const MobileChatScreen = () => {
  const activeRoom = useRooms((state) => state.activeRoom);

  if (!activeRoom) return <ConversationsList />;

  return (
    <div className={clsx("mobileChatScreen", "flex h-full min-h-0 flex-col")}>
      <div className={clsx("messagesPanel", "min-h-0 flex-1")}>
        <MessageList />
      </div>
      <Composer />
    </div>
  );
};
