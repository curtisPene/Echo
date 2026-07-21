import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerViewport,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import clsx from "clsx";

export const MessageList = () => {
  return (
    <div className={clsx("messageList", "flex h-full flex-col p-2")}>
      <div>
        <MessageScrollerProvider autoScroll>
          <MessageScroller className={clsx("min-h-0 flex-1")}>
            <MessageScrollerViewport>
              <MessageScrollerContent className={clsx("px-4 py-3")}>
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
    </div>
  );
};
