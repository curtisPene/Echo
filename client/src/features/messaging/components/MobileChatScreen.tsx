import clsx from "clsx";
import { ChevronLeftIcon } from "lucide-react";
import { useRooms } from "@/stores/useRooms";
import { ConversationsList } from "@/features/rooms/components/ConversationList";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";

export const MobileChatScreen = () => {
  const activeRoom = useRooms((state) => state.activeRoom);
  const clearActiveRoom = useRooms((state) => state.clearActiveRoom);

  if (!activeRoom) return <ConversationsList />;

  return (
    <div className={clsx("mobileChatScreen", "flex h-full min-h-0 flex-col")}>
      <div
        className={clsx(
          "mobileChatScreenHeader",
          "border-border flex shrink-0 items-center gap-2 border-b px-1 pb-3",
        )}
      >
        <button
          type="button"
          onClick={clearActiveRoom}
          className={clsx(
            "backButton",
            "text-muted-foreground hover:bg-brand/10 hover:text-brand flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
          )}
        >
          <ChevronLeftIcon size={20} strokeWidth={2} />
        </button>
        <h1 className="text-foreground truncate text-xl font-semibold">
          {activeRoom?.name}
        </h1>
      </div>
      <div className={clsx("messagesPanel", "min-h-0 flex-1")}>
        <MessageList />
      </div>
      <Composer />
    </div>
  );
};
