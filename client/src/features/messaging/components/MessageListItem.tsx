import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble";
import type { Message } from "../types";
import clsx from "clsx";

const formatMessageTime = (isoDate: string) => {
  return new Date(isoDate).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const MessageListItem = ({
  message,
  isOwnMessage,
}: {
  message: Message;
  isOwnMessage: boolean;
}) => {
  const align = isOwnMessage ? "end" : "start";
  const alignReaction = isOwnMessage ? "start" : "end";

  return (
    <div className={clsx("messageListItem", "flex w-full flex-col gap-1")}>
      <Bubble
        align={align}
        variant={isOwnMessage ? "default" : "secondary"}
        className={
          isOwnMessage
            ? "*:data-[slot=bubble-content]:bg-brand *:data-[slot=bubble-content]:text-brand-foreground"
            : ""
        }
      >
        <BubbleContent>
          {message.redacted ? "This message was deleted" : message.text}
        </BubbleContent>
        <BubbleReactions
          align={alignReaction}
          side="bottom"
          role="img"
          aria-label="Reactions: thumbs up, surprised"
        >
          <span>👍</span>
          <span>😮</span>
        </BubbleReactions>
      </Bubble>
      <span
        className={clsx(
          "deliveryTime",
          `text-muted-foreground px-1 text-xs ${isOwnMessage ? "self-end" : "self-start"}`,
        )}
      >
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
};
