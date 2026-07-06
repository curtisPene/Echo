import clsx from "clsx";
import styles from "./DesktopShell.module.css";

import { PanelLeftIcon } from "lucide-react";
import { Composer } from "@/features/messaging/components/composer/Composer";
import { useDesktopShellView } from "@/app/hooks/useDesktopShellView";
import { DesktopSidebar } from "@/app/components/desktopSidebar/DesktopSidebar";
import { Button } from "@/components/button/Button";

export const DesktopShell = () => {
  const { wrapperRef, selectNavItem, navItems, activeRoom, onToggleSidebar } =
    useDesktopShellView();

  return (
    <div className={clsx(styles.root)}>
      <DesktopSidebar
        ref={wrapperRef}
        selectNavItem={selectNavItem}
        navItems={navItems}
      />
      <div className={clsx(styles.inset)}>
        <div className={clsx(styles.insetHeader)}>
          <Button variant="icon" onClick={onToggleSidebar}>
            <PanelLeftIcon width={16} height={16} />
          </Button>
          <div className={clsx(styles.conversationTitle)}>
            <span>{activeRoom && activeRoom.name}</span>
          </div>
        </div>
        <div className={clsx(styles.insetContent, "insetContent")}>
          <Composer />
        </div>
      </div>
    </div>
  );
};
