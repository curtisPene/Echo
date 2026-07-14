import { useAuth } from "@/stores/useAuth";
import { useRooms } from "@/stores/useRooms";
import { BellDotIcon, BellIcon, MessageCircleIcon } from "lucide-react";

export const useLayoutController = () => {
  const rooms = useRooms((state) => state.rooms);
  const user = useAuth((state) => state.user);
  const pendingRooms = rooms.filter((room) => {
    return room.participants.some(
      (participant) =>
        participant.status === "pending" && participant.user.id === user?.id,
    );
  });

  const navItems = [
    { path: "/chats", icon: MessageCircleIcon },
    {
      path: "/requests",
      icon: pendingRooms.length === 0 ? BellIcon : BellDotIcon,
    },
    { path: "/profile", icon: BellIcon },
  ];
  const desktopNavItems = navItems.filter((item) => item.path !== "/profile");
  const mobileNavItems = navItems;

  return { desktopNavItems, mobileNavItems };
};
