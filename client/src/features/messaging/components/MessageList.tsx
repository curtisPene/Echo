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
import clsx from "clsx";
import { useAcceptRequest } from "../hooks/useAcceptRequest";

export const MessageList = () => {
  const { roomMessages, user, activeRoom, isRoomAccepted } =
    useConversationView();
  const { onAcceptRequest } = useAcceptRequest();

  return (
    <div className="messageList flex h-full flex-col p-2">
      <div className="messageListHeader border-border mb-2 hidden shrink-0 flex-row items-center justify-center border-b-2 px-4 py-2 sm:flex">
        <span className="size-8" aria-hidden />
        <h2 className="text-foreground text-center font-semibold">
          {activeRoom?.name}
        </h2>
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
              {!isRoomAccepted && activeRoom && (
                <span
                  className={clsx(
                    "requestMessage",
                    "text-muted-foreground text-caption border-border border-t-2 pt-4 text-center",
                  )}
                >
                  You'll be able to send messages once you{" "}
                  <span
                    className="text-muted-foreground underline hover:cursor-pointer"
                    onClick={onAcceptRequest}
                  >
                    accept the request
                  </span>{" "}
                </span>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
};
