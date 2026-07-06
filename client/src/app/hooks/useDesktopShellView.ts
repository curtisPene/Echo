import { useRooms } from "@/stores/useRooms";
import {
  MessageCircleIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";

export const NAV_BAR_CONFIG: Record<
  "chats" | "contacts",
  {
    key: "chats" | "contacts";
    icon: LucideIcon;
    label: string;
  }
> = {
  chats: {
    key: "chats",
    icon: MessageCircleIcon,
    label: "Conversations",
  },
  contacts: {
    key: "contacts",
    icon: UsersRoundIcon,
    label: "Contacts",
  },
};

export const useDesktopShellView = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const activeRoom = useRooms((state) => state.activeRoom);
  const navItems = Object.values(NAV_BAR_CONFIG);

  const onToggleSidebar = () => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current as HTMLDivElement;
    const current = getComputedStyle(wrapper).getPropertyValue("--progress");
    wrapper.style.setProperty("--progress", current === "0" ? "1" : "0");
  };

  const selectNavItem = () => {
    wrapperRef.current?.style.setProperty("--progress", "1");
  };

  return {
    wrapperRef,
    onToggleSidebar,
    selectNavItem,
    navItems,
    activeRoom,
  };
};
