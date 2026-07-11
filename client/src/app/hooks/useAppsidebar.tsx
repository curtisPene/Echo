import { ContactsList } from "@/features/contacts/components/ContactsList";
import { ConversationsList } from "@/features/rooms/components/ConversationList";
import { RequestsList } from "@/features/rooms/components/RequstsList";
import { useRooms } from "@/stores/useRooms";
import {
  BellIcon,
  MessageSquareIcon,
  SettingsIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useState } from "react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Chats",
      url: "/chats",
      icon: MessageSquareIcon,
      content: ConversationsList,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: UsersRoundIcon,
      content: ContactsList,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Requests",
      url: "/requests",
      icon: BellIcon,
      content: RequestsList,
    },
  ],
};

export const useAppSidebar = () => {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const { activeRoom } = useRooms();

  return {
    data,
    activeItem,
    setActiveItem,
    activeRoom,
  };
};
