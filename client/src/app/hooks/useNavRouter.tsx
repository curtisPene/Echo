import type { Room } from "@/features/rooms/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRooms } from "@/stores/useRooms";
import {
  BellIcon,
  MessageSquareIcon,
  SettingsIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

import { useLocation, useNavigate } from "react-router";

export type Title = "chats" | "contacts" | "settings" | "requests" | "room";

type NavData = {
  url: string;
  icon: LucideIcon;
};

const data: Record<Title, NavData> = {
  chats: {
    url: "/chats",
    icon: MessageSquareIcon,
  },
  contacts: {
    url: "/contacts",
    icon: UsersRoundIcon,
  },
  requests: {
    url: "/requests",
    icon: BellIcon,
  },
  settings: {
    url: "/settings",
    icon: SettingsIcon,
  },
  room: {
    url: "/chats",
    icon: MessageSquareIcon,
  },
};

export const navLabels: Record<Title, string> = {
  chats: "Chats",
  contacts: "Contacts",
  requests: "Requests",
  settings: "Settings",
  room: "Room",
};

const desktopNavKeys: Title[] = ["chats", "contacts", "requests"];
const mobileNavKeys: Title[] = ["chats", "contacts", "requests", "settings"];

export const useNavRouter = () => {
  const { activeRoom, setACtiveRoom } = useRooms();
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const onNavigate = (screen: Title, room?: Room) => {
    const item = data[screen];
    if (!item) return;
    if (screen === "room" && room) {
      setACtiveRoom(room.id, room.name);
      if (isMobile) navigate(`/chats/${room.id}`);
      return;
    }
    navigate(item.url);
  };

  useEffect(() => {
    if (!isMobile && pathname.startsWith("/chats/")) navigate("/chats");
  }, [isMobile, pathname, navigate]);

  const activeNavKey = pathname.split("/")[1] as Title;

  return {
    desktopNavKeys,
    mobileNavKeys,
    data,
    activeRoom,
    activeNavKey,
    pathname,
    onNavigate,
  };
};
