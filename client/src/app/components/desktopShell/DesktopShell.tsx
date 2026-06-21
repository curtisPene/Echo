import clsx from "clsx";
import styles from "./DesktopShell.module.css";

import {
  CommandIcon,
  MessageCircleIcon,
  PanelLeftIcon,
  SettingsIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import {
  useRef,
  useState,
  type Dispatch,
  type JSX,
  type RefObject,
  type SetStateAction,
} from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { Button } from "@/components/button/Button";
import { ConversationList } from "@/features/messaging/components/ConversationList";
import { ContactsList } from "@/features/contacts/components/ContactsList";
import { ConversationsHeader } from "@/features/messaging/components/ConversationsHeader";
import { ContactsHeader } from "@/features/contacts/components/ContactsHeader";
import { Composer } from "@/features/messaging/components/Composer";

export const DesktopSidebar = ({
  ref,
  active,
  setActive,
}: {
  ref: RefObject<HTMLDivElement | null>;
  active: keyof typeof NAV_BAR_CONFIG;
  setActive: Dispatch<SetStateAction<keyof typeof NAV_BAR_CONFIG>>;
}) => {
  const Header = NAV_BAR_CONFIG[active].renderHeader;
  const Content = NAV_BAR_CONFIG[active].render;

  return (
    <div ref={ref} className={clsx(styles.sidebarWrapper, "sidebarWrapper")}>
      <div className={clsx(styles.sidebarInner)}>
        <div className={clsx(styles.iconBar, "iconBar")}>
          <div className={clsx("iconBarHeader")}>
            <Button variant="menuIcon">
              <CommandIcon width={24} height={24} />
            </Button>
          </div>
          <div className={clsx(styles.iconBarContent, "iconBarContent")}>
            {Object.entries(NAV_BAR_CONFIG).map(([key, config]) => (
              <Button
                onClick={() => setActive(key as keyof typeof NAV_BAR_CONFIG)}
                aria-pressed={key === active}
                key={key}
                variant="menuIcon"
              >
                <config.icon width={18} height={18} />
              </Button>
            ))}
          </div>
          <div className={clsx(styles.iconBarFooter, "iconBarFooter")}>
            <Avatar firstName="curtis" lastName="pene" />
            <Button variant="menuIcon">
              <SettingsIcon width={18} height={18} />
            </Button>
          </div>
        </div>
        <div className={clsx(styles.detailsBar, "detailsBar")}>
          <div className={clsx(styles.detailsBarHeader, "detailsBarHeader")}>
            {Header && <Header />}
          </div>
          <div className={clsx(styles.detailsBarContent, "detailsBarContent")}>
            <Content />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DesktopInset = ({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) => {
  return (
    <div className={clsx(styles.inset, "inset")}>
      <div className={clsx(styles.insetHeader, "insetHeader")}>
        <Button variant="icon" onClick={onToggleSidebar}>
          <PanelLeftIcon width={16} height={16} />
        </Button>
      </div>
      <Composer />
      <div className={clsx("insetHeader")}></div>
    </div>
  );
};

const NAV_BAR_CONFIG: Record<
  "conversations" | "contacts",
  {
    key: "conversations" | "contacts";
    icon: LucideIcon;
    label: string;
    render: () => JSX.Element;
    renderHeader?: () => JSX.Element;
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

export const DesktopShell = () => {
  const [active, setActive] =
    useState<keyof typeof NAV_BAR_CONFIG>("conversations");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const onToggleSidebar = () => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current as HTMLDivElement;
    const current = wrapper.style.getPropertyValue("--sidebarOpen");
    wrapper.style.setProperty("--sidebarOpen", current === "0" ? "1" : "0");
  };

  return (
    <div className={clsx(styles.root, "desktopShell")}>
      <DesktopSidebar active={active} ref={wrapperRef} setActive={setActive} />
      <DesktopInset onToggleSidebar={onToggleSidebar} />
    </div>
  );
};
