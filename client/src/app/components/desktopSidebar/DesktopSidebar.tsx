import clsx from "clsx";
import styles from "./DesktopSidebar.module.css";

import { CommandIcon, SettingsIcon } from "lucide-react";
import { type RefObject } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { Button } from "@/components/button/Button";
import buttonStyles from "@/components/button/Button.module.css";
import type { NAV_BAR_CONFIG } from "@/app/hooks/useDesktopShellView";
import { Outlet, Link } from "react-router";

export const DesktopSidebar = ({
  ref,
  navItems,
}: {
  ref: RefObject<HTMLDivElement | null>;
  navItems: (typeof NAV_BAR_CONFIG)[keyof typeof NAV_BAR_CONFIG][];
  selectNavItem: (key: keyof typeof NAV_BAR_CONFIG) => void;
}) => {
  return (
    <div ref={ref} className={clsx(styles.root)}>
      <div className={clsx(styles.sidebarInner)}>
        <div className={clsx(styles.iconBar)}>
          <div className={clsx()}>
            <Button variant="menuIcon">
              <CommandIcon width={24} height={24} />
            </Button>
          </div>
          <div className={clsx(styles.iconBarContent)}>
            {navItems.map((item) => (
              <Link to={`/${item.key}`} className={clsx(buttonStyles.link)}>
                <item.icon
                  width={18}
                  height={18}
                  className={clsx(styles.icon)}
                />
              </Link>
            ))}
          </div>
          <div className={clsx(styles.iconBarFooter)}>
            <Avatar firstName="curtis" lastName="pene" />
            <Link to="/settings" className={clsx(buttonStyles.link)}>
              <SettingsIcon
                width={18}
                height={18}
                className={clsx(styles.icon)}
              />
            </Link>
          </div>
        </div>
        <div className={clsx(styles.detailsBar)}>
          <div className={clsx(styles.detailsBarContent)}>{<Outlet />}</div>
        </div>
      </div>
    </div>
  );
};
