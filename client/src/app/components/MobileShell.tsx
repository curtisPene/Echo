import clsx from "clsx";
import { ChevronLeftIcon, MoreVerticalIcon } from "lucide-react";
import { navLabels, useNavRouter } from "../hooks/useNavRouter";
import { NavIcon } from "./NavIcon";
import { Link, Outlet } from "react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const MobileShell = () => {
  const {
    mobileNavKeys,
    data,
    pathname,
    activeNavKey,
    onNavigate,
    activeRoom,
  } = useNavRouter();

  const inActiveChat = pathname.startsWith("/chats/");

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
        {inActiveChat ? (
          <Link
            to="/chats"
            className={clsx(
              "backButton",
              "text-muted-foreground hover:bg-brand/10 hover:text-brand -ml-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
            )}
          >
            <ChevronLeftIcon size={20} strokeWidth={2} />
          </Link>
        ) : null}
        <h1 className="text-foreground min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">
          {inActiveChat ? activeRoom?.name : navLabels[activeNavKey]}
        </h1>
        {inActiveChat ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-muted-foreground hover:bg-brand/10 hover:text-brand flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
              aria-label="Conversation options"
            >
              <MoreVerticalIcon size={20} strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive">Block</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <div
        className={clsx(
          "contentPanel",
          "min-h-0 flex-1 overflow-y-auto p-4 pb-24",
        )}
      >
        <Outlet />
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
          {mobileNavKeys.map((key) => {
            const item = data[key];
            return (
              <button
                key={key}
                data-active={pathname.includes(key)}
                onClick={() => {
                  onNavigate(key);
                }}
                className={clsx(
                  "iconBarItem",
                  "text-muted-foreground hover:bg-brand/10 hover:text-brand data-[active=true]:bg-brand/15 data-[active=true]:text-brand flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
                )}
              >
                <NavIcon navKey={key} item={item} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
