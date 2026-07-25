import { Bubble, BubbleContent } from "@/components/ui/bubble";
import type { MessageDTO } from "../entities/message";
import { formatMessageTimestamp } from "@/lib/utils";
import clsx from "clsx";

export const MessageListItem = ({
  message,
  isOwnMessage,
  showTimestamp = true,
}: {
  message: MessageDTO;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
}) => {
  const align = isOwnMessage ? "end" : "start";

  return (
    <div className={clsx("messageListItem", "flex w-full flex-col gap-2")}>
      <Bubble
        align={align}
        variant={isOwnMessage ? "default" : "secondary"}
        className={clsx(
          "cursor-pointer",
          isOwnMessage &&
            "*:data-[slot=bubble-content]:bg-brand *:data-[slot=bubble-content]:text-brand-foreground",
        )}
      >
        <BubbleContent>
          {message.redacted ? "This message was deleted" : message.text}
        </BubbleContent>
      </Bubble>
      {showTimestamp && (
        <span
          className={clsx(
            "deliveryTime",
            "text-muted-foreground px-1 text-xs",
            isOwnMessage ? "self-end" : "self-start",
          )}
        >
          {formatMessageTimestamp(message.createdAt)}
        </span>
      )}
    </div>
  );
};
