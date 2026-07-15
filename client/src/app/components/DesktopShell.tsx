import clsx from "clsx";
import { Input } from "@/components/ui/input";
import { EllipsisVerticalIcon, MessageCircleIcon, SearchIcon } from "lucide-react";
import { Composer } from "@/features/messaging/components/Composer";
import { MessageList } from "@/features/messaging/components/MessageList";
import { EchoLogo } from "./EchoLogo";
import { UserAvatar } from "@/components/UserAvatar";
import { useLayoutController } from "../hooks/useLayoutController";
import { NavItem } from "@/components/NavItem";
import { Outlet } from "react-router";
import { useDesktopShellView } from "../hooks/useDesktopShellView";
import { ConversationDetailsContent } from "@/features/rooms/components/ConversationDetailsContent";

export const DesktopShell = () => {
  const { desktopNavItems } = useLayoutController();
  const {
    listHeader,
    activeRoom,
    isDetailsVisible,
    setIsDetailsVisible,
  } = useDesktopShellView();
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
          {desktopNavItems.map((item) => {
            return <NavItem icon={item.icon} to={item.path} />;
          })}
        </div>
        <div
          className={clsx("iconBarFooter", "flex flex-col items-center gap-3")}
        >
          <button className="cursor-pointer">
            <UserAvatar />
          </button>
        </div>
      </div>
      <div
        className={clsx(
          "listPanel",
          "listPanel bg-card flex w-55 shrink-0 flex-col overflow-y-auto rounded-2xl p-3 shadow-md sm:hidden md:flex xl:w-80",
        )}
      >
        <div className="listPanelHeader flex flex-col gap-3 pb-3">
          <h1 className="text-foreground flex flex-row items-center justify-between px-1 text-xl font-semibold">
            {listHeader}
          </h1>
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input placeholder="Search" className="pl-9" />
          </div>
        </div>
        <Outlet />
      </div>
      {activeRoom ? (
        <div className="conversationPanel flex flex-1 flex-col gap-5">
          <div className="messagesPanel bg-card flex min-h-0 flex-1 flex-col rounded-2xl shadow-md">
            <div
              className={clsx(
                "messageListHeader",
                "border-border hidden shrink-0 flex-row items-center justify-between border-b-2 px-4 py-2 sm:flex lg:justify-center",
              )}
            >
              <span className={clsx("size-8")} aria-hidden />
              <h2
                className={clsx(
                  "text-foreground",
                  "text-center font-semibold",
                )}
              >
                {activeRoom.name}
              </h2>
              <button
                className={clsx("roomDetailsTrigger", "lg:hidden")}
                onClick={() => setIsDetailsVisible(!isDetailsVisible)}
              >
                <EllipsisVerticalIcon size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {isDetailsVisible ? (
                <ConversationDetailsContent />
              ) : (
                <MessageList />
              )}
            </div>
          </div>
          <Composer />
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
