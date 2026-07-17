import clsx from "clsx";
import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import { useLayoutController } from "../hooks/useLayoutController";
import { useListHeader } from "../hooks/useListHeader";
import { NavItem } from "@/components/NavItem";
import { useConversationDetailsViewModel } from "@/domains/conversations/viewModels/useConversationDetailsViewModel";
import { useConversationListViewModel } from "@/domains/conversations/viewModels/useConversationListViewModel";
import { MessageList } from "@/domains/messaging/components/MessageList";
import { Composer } from "@/domains/messaging/components/Composer";

export const MobileShell = () => {
  const listHeader = useListHeader();
  const { mobileNavItems } = useLayoutController();
  const { room } = useConversationDetailsViewModel();
  const { clearActiveRoom } = useConversationListViewModel();

  return (
    <div
      className={clsx(
        "mobileShell",
        "bg-background flex h-dvh w-full flex-col sm:hidden",
      )}
    >
      <div
        className={clsx(
          "mobileHeader",
          "from-brand/15 via-background to-background flex shrink-0 items-center gap-2 bg-linear-to-br px-5 pt-6 pb-4",
        )}
      >
        {room && (
          <button
            type="button"
            aria-label="Back to conversations"
            onClick={clearActiveRoom}
            className="text-foreground -ml-1 flex size-8 shrink-0 items-center justify-center"
          >
            <ChevronLeftIcon size={22} />
          </button>
        )}
        <h1 className="text-foreground min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">
          {room ? room.name : listHeader}
        </h1>
      </div>
      <div
        className={clsx(
          "contentPanel",
          "flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pb-24",
        )}
      >
        {room ? (
          <div
            className={clsx("mobileChatScreen", "flex h-full min-h-0 flex-col")}
          >
            <div className={clsx("messagesPanel", "min-h-0 flex-1")}>
              <MessageList />
            </div>
            <Composer />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
      <div
        className={clsx(
          "bottomNav",
          "pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4",
        )}
      >
        <div
          className={clsx(
            "bottomNavBar",
            "bg-card pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-full px-4 py-2 shadow-md",
          )}
        >
          {mobileNavItems.map((item) => (
            <NavItem key={item.path} icon={item.icon} to={item.path} />
          ))}
        </div>
      </div>
    </div>
  );
};
