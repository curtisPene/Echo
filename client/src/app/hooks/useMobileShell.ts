import { ContactsList } from "@/features/contacts/components/ContactsList";
import { RequestsList } from "@/features/rooms/components/RequstsList";
import { MobileChatScreen } from "@/features/messaging/components/MobileChatScreen";
import {
  BellIcon,
  MessageSquareIcon,
  SettingsIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useState } from "react";

const data = {
  navMain: [
    {
      title: "Chats",
      icon: MessageSquareIcon,
      content: MobileChatScreen,
    },
    {
      title: "Contacts",
      icon: UsersRoundIcon,
      content: ContactsList,
    },
    {
      title: "Settings",
      icon: SettingsIcon,
    },
    {
      title: "Requests",
      icon: BellIcon,
      content: RequestsList,
    },
  ],
};

export const useMobileShell = () => {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);

  return {
    data,
    activeItem,
    setActiveItem,
  };
};
