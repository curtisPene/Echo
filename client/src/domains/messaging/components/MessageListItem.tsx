import { Bubble, BubbleContent } from "@/components/ui/bubble";
import type { MessageDTO } from "../domainModels/message";
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
  message: MessageDTO;
  isOwnMessage: boolean;
}) => {
  const align = isOwnMessage ? "end" : "start";

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
