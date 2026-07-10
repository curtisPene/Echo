import { Bubble, BubbleContent } from "@/components/ui/bubble";
import type { Message } from "../types";

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

  return (
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
      <span
        className={`text-muted-foreground px-1 text-xs ${isOwnMessage ? "self-end" : ""}`}
      >
        {formatMessageTime(message.createdAt)}
      </span>
    </Bubble>
  );
};
