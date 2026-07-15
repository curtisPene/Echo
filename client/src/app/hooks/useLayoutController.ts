import {
  BellDotIcon,
  BellIcon,
  MessageCircleIcon,
  UserIcon,
} from "lucide-react";
import { useConversationListViewModel } from "@/domains/conversation/viewModels/useConversationListViewModel";

export const useLayoutController = () => {
  const { pendingRooms } = useConversationListViewModel();
  const hasPendingRequests = pendingRooms.length > 0;

  const navItems = [
    { path: "/chats", icon: MessageCircleIcon },
    {
      path: "/requests",
      icon: hasPendingRequests ? BellDotIcon : BellIcon,
    },
    { path: "/profile", icon: UserIcon },
  ];
  const desktopNavItems = navItems.filter((item) => item.path !== "/profile");
  const mobileNavItems = navItems;

  return { desktopNavItems, mobileNavItems };
};
