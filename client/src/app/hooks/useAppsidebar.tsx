import { useSidebar } from "@/components/ui/sidebar";
import { ContactsList } from "@/features/contacts/components/ContactsList";
import {
  Message01Icon,
  UserGroupIcon,
  AddSquareIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
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
      icon: Message01Icon,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: UserGroupIcon,
      content: ContactsList,
    },
    {
      title: "New Conversation",
      url: "/chats/new",
      icon: AddSquareIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings02Icon,
    },
  ],
};

export const useAppSidebar = () => {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const { setOpen } = useSidebar();

  return {
    data,
    activeItem,
    setActiveItem,
    setOpen,
  };
};
