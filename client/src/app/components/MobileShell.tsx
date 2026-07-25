import clsx from "clsx";
import { Outlet } from "react-router";
import {
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  MessageCircleIcon,
  BellIcon,
  UserIcon,
} from "lucide-react";
import { NavItem } from "@/components/NavItem";
import { useMobileHeader } from "@/app/hooks/useMobileHeader";

const MOBILE_NAV_ITEMS: { path: string; icon: typeof ChevronLeftIcon }[] = [
  { path: "/chats", icon: MessageCircleIcon },
  { path: "/requests", icon: BellIcon },
  { path: "/profile", icon: UserIcon },
];

export const MobileShell = () => {
  const { title, showBackButton, showRoomDetailsButton, goBack, viewRoomDetails } =
    useMobileHeader();

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
        {showBackButton && (
          <button
            type="button"
            aria-label="Back to conversations"
            onClick={goBack}
            className="text-foreground -ml-1 flex size-8 shrink-0 items-center justify-center"
          >
            <ChevronLeftIcon size={22} />
          </button>
        )}
        <h1 className="text-foreground min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {showRoomDetailsButton && (
          <button
            type="button"
            aria-label="Conversation details"
            onClick={viewRoomDetails}
            className="text-foreground -mr-1 flex size-8 shrink-0 items-center justify-center"
          >
            <EllipsisVerticalIcon size={20} />
          </button>
        )}
      </div>
      <div
        className={clsx(
          "contentPanel",
          "flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pb-24",
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
          {MOBILE_NAV_ITEMS.map((item) => (
            <NavItem key={item.path} icon={item.icon} to={item.path} />
          ))}
        </div>
      </div>
    </div>
  );
};
