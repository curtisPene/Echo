import clsx from "clsx";
import styles from "./DesktopSidebar.module.css";

import { CommandIcon, SettingsIcon } from "lucide-react";
import { type JSX, type RefObject } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { Button } from "@/components/button/Button";
import type { NAV_BAR_CONFIG } from "@/app/hooks/useDesktopShell";

export const DesktopSidebar = ({
  ref,
  active,
  selectNavItem,
  Header,
  Content,
  navItems,
}: {
  ref: RefObject<HTMLDivElement | null>;
  active: keyof typeof NAV_BAR_CONFIG;
  Header: () => JSX.Element;
  Content: () => JSX.Element;
  navItems: (typeof NAV_BAR_CONFIG)[keyof typeof NAV_BAR_CONFIG][];
  selectNavItem: (key: keyof typeof NAV_BAR_CONFIG) => void;
}) => {
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
            {navItems.map((item) => (
              <Button
                onClick={() => selectNavItem(item.key)}
                aria-pressed={item.key === active}
                key={item.key}
                variant="menuIcon"
              >
                <item.icon width={18} height={18} />
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
