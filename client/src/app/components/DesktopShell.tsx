import clsx from "clsx";
import { useAppSidebar } from "../hooks/useAppsidebar";
import { MessageCircleIcon, SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useAuth } from "@/stores/useAuth";
import { Composer } from "@/features/messaging/components/Composer";
import { MessageList } from "@/features/messaging/components/MessageList";
import { AddContactDialog } from "@/features/contacts/components/addContactDialog";
import { NavIcon } from "./NavIcon";
import { EchoLogo } from "./EchoLogo";

export const DesktopShell = () => {
  const { data, activeItem, setActiveItem, activeRoom } = useAppSidebar();
  const { user } = useAuth();
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
          {data.navMain.map((item) => {
            return item.title !== "Settings" ? (
              <button
                data-active={item.title === activeItem.title}
                onClick={() => {
                  setActiveItem(item);
                }}
                className={clsx(
                  "iconBarItem",
                  "text-muted-foreground hover:bg-brand/10 hover:text-brand data-[active=true]:bg-brand/15 data-[active=true]:text-brand flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
                )}
              >
                <NavIcon item={item} />
              </button>
            ) : null;
          })}
        </div>
        <div
          className={clsx("iconBarFooter", "flex flex-col items-center gap-3")}
        >
          <button
            className={clsx(
              "text-muted-foreground hover:bg-brand/10 hover:text-brand flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
            )}
          >
            <SettingsIcon size={18} strokeWidth={2} />
          </button>
          <button className="cursor-pointer">
            <Avatar className="ring-brand rounded-full ring-2">
              <AvatarFallback>
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
      <div
        className={clsx(
          "listPanel",
          "listPanel bg-card flex shrink-0 flex-col overflow-y-auto rounded-2xl p-3 shadow-md sm:w-55 md:w-80",
        )}
      >
        <div className="listPanelHeader flex flex-col gap-3 pb-3">
          <h1 className="text-foreground flex flex-row items-center justify-between px-1 text-xl font-semibold">
            {activeItem.title}{" "}
            {activeItem.title === "Contacts" ? <AddContactDialog /> : null}
          </h1>
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input placeholder="Search" className="pl-9" />
          </div>
        </div>
        {activeItem.content ? <activeItem.content /> : null}
      </div>
      {activeRoom ? (
        <div className="conversationPanel flex flex-1 flex-col gap-5">
          <div className="messagesPanel bg-card min-h-0 flex-1 rounded-2xl shadow-md">
            <MessageList />
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
    </div>
  );
};
