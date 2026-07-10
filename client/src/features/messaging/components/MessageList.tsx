import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { MessageListItem } from "./MessageListItem";
import { useConversationView } from "../hooks/useConversationView";

export const MessageList = () => {
  const { roomMessages, user, activeRoom } = useConversationView();

  return (
    <div className="messageList flex h-full flex-col p-2">
      <div className="messageListHeader border-border mb-2 shrink-0 px-4 py-2 text-center">
        <h2 className="text-foreground font-semibold">{activeRoom?.name}</h2>
      </div>
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="px-4 py-3">
              {roomMessages?.map((message) => {
                const isOwnMessage = message.sender === user.id;
                return (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <MessageListItem
                      message={message}
                      isOwnMessage={isOwnMessage}
                    />
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
};
