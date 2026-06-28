import { ContactsHeader } from "@/features/contacts/components/contactsHeader/ContactsHeader";
import { ContactsList } from "@/features/contacts/components/contactsList/ContactsList";
import { ConversationList } from "@/features/rooms/components/conversationList/ConversationList";
import { ConversationsHeader } from "@/features/rooms/components/conversationsHeader/ConversationsHeader";
import {
  MessageCircleIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type JSX } from "react";

export const NAV_BAR_CONFIG: Record<
  "conversations" | "contacts",
  {
    key: "conversations" | "contacts";
    icon: LucideIcon;
    label: string;
    render: () => JSX.Element;
    renderHeader: () => JSX.Element;
  }
> = {
  conversations: {
    key: "conversations",
    icon: MessageCircleIcon,
    label: "Conversations",
    render: ConversationList,
    renderHeader: ConversationsHeader,
  },
  contacts: {
    key: "contacts",
    icon: UsersRoundIcon,
    label: "Contacts",
    render: ContactsList,
    renderHeader: ContactsHeader,
  },
};

export const useDesktopShell = () => {
  const [active, setActive] =
    useState<keyof typeof NAV_BAR_CONFIG>("conversations");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const Header = NAV_BAR_CONFIG[active].renderHeader;
  const Content = NAV_BAR_CONFIG[active].render;
  const navItems = Object.values(NAV_BAR_CONFIG);

  const onToggleSidebar = () => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current as HTMLDivElement;
    const current = wrapper.style.getPropertyValue("--sidebarOpen");
    wrapper.style.setProperty("--sidebarOpen", current === "0" ? "1" : "0");
  };

  const selectNavItem = (key: keyof typeof NAV_BAR_CONFIG) => {
    setActive(key);
    wrapperRef.current?.style.setProperty("--sidebarOpen", "1");
  };

  return {
    active,
    wrapperRef,
    onToggleSidebar,
    selectNavItem,
    Header,
    Content,
    navItems,
  };
};
