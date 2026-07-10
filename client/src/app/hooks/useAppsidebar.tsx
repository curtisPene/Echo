import { ContactsList } from "@/features/contacts/components/ContactsList";
import { ConversationsList } from "@/features/rooms/components/ConversationList";
import { useRooms } from "@/stores/useRooms";
import { MessageSquareIcon, SettingsIcon, UsersRoundIcon } from "lucide-react";
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
