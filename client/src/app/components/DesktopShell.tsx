import clsx from "clsx";
import { BellIcon, MessageCircleIcon } from "lucide-react";
import { ConversationScreen } from "@/domains/messaging/components/ConversationScreen";
import { EchoLogo } from "./EchoLogo";
import { ProfileButton } from "./ProfileButton";
import { ConversationsList } from "@/domains/conversations/components/ConversationList";
import { RequestsList } from "@/domains/conversations/components/RequstsList";
import { ConversationDetailsContent } from "@/domains/conversations/components/ConversationDetailsContent";
import { useActiveRoom } from "@/stores/useActiveRoom";
import {
  useLayoutController,
  type ActivePanel,
} from "@/app/hooks/useLayoutController";

const PANELS: Record<
  ActivePanel,
  { label: string; Component: () => React.JSX.Element }
> = {
  conversations: { label: "Chats", Component: ConversationsList },
  notifications: { label: "Notifications", Component: RequestsList },
};

export const DesktopShell = () => {
  const { activeRoom } = useActiveRoom();
  const { activePanel, viewConversations, viewNotifications } =
    useLayoutController();
  const { label: listHeader, Component: ActiveListPanel } = PANELS[activePanel];

  return (
    <div className="desktopShell from-brand/15 via-background to-background hidden h-dvh w-full flex-row gap-5 bg-linear-to-br p-4 sm:flex">
      <div
        className={clsx(
          "iconBar",
          "bg-card flex w-16 shrink-0 flex-col items-center gap-8 rounded-2xl py-4 shadow-md",
        )}
      >
        <div className={clsx("iconBarHeader")}>
          <button
            className={clsx(
              "iconBarItem",
              "bg-brand text-brand-foreground flex size-11 cursor-pointer items-center justify-center rounded-full shadow-md",
            )}
          >
            <EchoLogo size={32} />
          </button>
        </div>
        <div
          className={clsx(
            "iconBarItems",
            "flex flex-1 flex-col items-center gap-3",
          )}
        >
          <button
            type="button"
            aria-label="Conversations"
            onClick={viewConversations}
            className={clsx(
              "iconBarItem",
              "text-muted-foreground hover:bg-brand/10 hover:text-brand flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
              activePanel === "conversations" && "bg-brand/15 text-brand",
            )}
          >
            <MessageCircleIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            onClick={viewNotifications}
            className={clsx(
              "iconBarItem",
              "text-muted-foreground hover:bg-brand/10 hover:text-brand flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
              activePanel === "notifications" && "bg-brand/15 text-brand",
            )}
          >
            <BellIcon size={18} />
          </button>
        </div>
        <div
          className={clsx("iconBarFooter", "flex flex-col items-center gap-3")}
        >
          <ProfileButton />
        </div>
      </div>
      <div
        className={clsx(
          "listPanel",
          "listPanel bg-card flex w-60 shrink-0 flex-col overflow-y-auto rounded-2xl p-3 shadow-md sm:flex xl:w-80",
        )}
      >
        <div className="listPanelHeader flex flex-col gap-3 pb-3">
          <h1 className="text-foreground px-1 text-xl font-semibold">
            {listHeader}
          </h1>
        </div>
        <ActiveListPanel />
      </div>
      {activeRoom ? (
        <div className="conversationPanel flex flex-1 flex-col">
          <ConversationScreen />
        </div>
      ) : (
        <div className="conversationPanel bg-card flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl shadow-md">
          <div className="bg-brand/20 flex size-16 items-center justify-center rounded-full">
            <MessageCircleIcon
              className="text-brand size-7"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            Select a conversation to start chatting
          </p>
        </div>
      )}
      <div
        className={clsx(
          "conversationDetailsPanel",
          "bg-card hidden w-65 shrink-0 flex-col overflow-y-auto rounded-2xl shadow-md lg:flex xl:w-80",
        )}
      >
        <ConversationDetailsContent />
      </div>
    </div>
  );
};
