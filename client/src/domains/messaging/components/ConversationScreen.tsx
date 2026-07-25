import clsx from "clsx";
import { EllipsisVerticalIcon, SendIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerViewport,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { BubbleGroup } from "@/components/ui/bubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConversationDetailsContent } from "@/domains/conversations/components/ConversationDetailsContent";
import { MessageListItem } from "@/domains/messaging/components/MessageListItem";
import { useLayoutController } from "@/app/hooks/useLayoutController";
import { useViewConversationViewModel } from "@/domains/messaging/viewModels/useViewConversationViewModel";
import { useAcceptInviteViewModel } from "@/domains/conversations/viewModels/useAcceptInviteViewModel";

export const ConversationScreen = () => {
  const { isDetailsVisible, viewRoomDetails, hideRoomDetails } =
    useLayoutController();
  const { activeRoom, messageListEntries, isPending } =
    useViewConversationViewModel();
  const { acceptInvite } = useAcceptInviteViewModel();
  const activeRoomId = activeRoom?.id ?? "";

  return (
    <div
      className={clsx(
        "conversationScreen",
        "bg-card relative flex h-full min-h-0 flex-col rounded-2xl shadow-md",
      )}
    >
      <div className="messagesPanel flex min-h-0 flex-1 flex-col">
        <div
          className={clsx(
            "messageListHeader",
            "border-border hidden shrink-0 flex-row items-center justify-between border-b-2 px-4 py-2 sm:flex lg:justify-center",
          )}
        >
          <span className={clsx("size-8")} aria-hidden />
          <h2 className={clsx("text-foreground", "text-center font-semibold")}>
            {activeRoom?.name}
          </h2>
          <button
            className={clsx(
              "roomDetailsTrigger",
              "lg:hidden, hover:cursor-pointer",
            )}
            type="button"
            onClick={() => viewRoomDetails(activeRoomId)}
          >
            <EllipsisVerticalIcon size={18} className="lg:hidden" />
          </button>
        </div>
        <div className={clsx("messageListContent", "min-h-0 flex-1 p-2")}>
          <MessageScrollerProvider autoScroll>
            <MessageScroller className={clsx("min-h-0 flex-1")}>
              <MessageScrollerViewport>
                <MessageScrollerContent className={clsx("px-4 py-3")}>
                  {messageListEntries.map((entry, index) => {
                    if (entry.kind === "divider") {
                      return (
                        <MessageScrollerItem key={`divider-${index}`}>
                          <div className="dateDivider flex justify-center py-2">
                            <span className="text-muted-foreground text-xs font-medium">
                              {entry.label}
                            </span>
                          </div>
                        </MessageScrollerItem>
                      );
                    }

                    return (
                      <MessageScrollerItem key={entry.messages[0].id}>
                        <div
                          className={clsx(
                            "messageCluster flex w-full items-center gap-2",
                            entry.isOwnCluster && "justify-end",
                          )}
                        >
                          {!entry.isOwnCluster && (
                            <Avatar className="ring-brand size-7 shrink-0 rounded-full ring-2">
                              <AvatarFallback className="rounded-full text-[10px]">
                                {entry.senderInitials}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            {!entry.isOwnCluster && (
                              <span className="text-muted-foreground px-1 text-xs font-medium">
                                {entry.senderName}
                              </span>
                            )}
                            <BubbleGroup
                              className={clsx(
                                entry.isOwnCluster
                                  ? "items-end"
                                  : "items-start",
                              )}
                            >
                              {entry.messages.map((message, messageIndex) => (
                                <MessageListItem
                                  key={message.id}
                                  message={message}
                                  isOwnMessage={entry.isOwnCluster}
                                  showTimestamp={
                                    messageIndex === entry.messages.length - 1
                                  }
                                />
                              ))}
                            </BubbleGroup>
                          </div>
                        </div>
                      </MessageScrollerItem>
                    );
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
        <div
          className={clsx(
            "roomDetailsOverlay",
            "bg-card absolute inset-0 z-10 flex-col overflow-y-auto rounded-2xl shadow-md",
            isDetailsVisible ? "flex" : "hidden",
          )}
        >
          <button
            className={clsx(
              "closeRoomDetailsButton",
              "text-muted-foreground hover:text-foreground absolute top-3 right-3 z-20 hover:cursor-pointer",
            )}
            type="button"
            aria-label="Close conversation details"
            onClick={() => hideRoomDetails(activeRoomId)}
          >
            <XIcon size={18} />
          </button>
          <ConversationDetailsContent />
        </div>
      </div>
      {isPending ? (
        <div className="composer border-border border-t-2 p-3">
          <p className="text-muted-foreground text-center text-sm">
            You need to accept this request before you can reply.{" "}
            <span
              role="button"
              onClick={() => activeRoom && acceptInvite(activeRoom.id)}
              className="text-brand cursor-pointer font-semibold"
            >
              Accept
            </span>
          </p>
        </div>
      ) : (
        <div className="composer border-border shrink-0 p-3">
          <form
            className="composerForm flex items-center gap-2"
            onSubmit={() => {}}
          >
            <Input type="text" placeholder="Type a message" />
            <button
              type="submit"
              className="bg-brand text-brand-foreground flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:opacity-90"
            >
              <SendIcon size={16} strokeWidth={2} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
