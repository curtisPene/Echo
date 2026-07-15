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
    <div className={clsx("messageList", "flex h-full flex-col p-2")}>
      <div>
        <MessageScrollerProvider autoScroll>
          <MessageScroller className={clsx("min-h-0 flex-1")}>
            <MessageScrollerViewport>
              <MessageScrollerContent className={clsx("px-4 py-3")}>
                {roomMessages?.map((message) => {
                  const isOwnMessage = message.sender === user.id;
                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      className={clsx(
                        "flex",
                        isOwnMessage ? "justify-end" : "justify-start",
                      )}
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
    </div>
  );
};
