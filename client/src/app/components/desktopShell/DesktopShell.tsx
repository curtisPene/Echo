import clsx from "clsx";
import styles from "./DesktopShell.module.css";

import { PanelLeftIcon } from "lucide-react";
import { Composer } from "@/features/messaging/components/composer/Composer";
import { useDesktopShell } from "@/app/hooks/useDesktopShell";
import { DesktopSidebar } from "@/app/components/desktopSidebar/DesktopSidebar";
import { Button } from "@/components/button/Button";

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

export const DesktopShell = () => {
  const {
    active,
    wrapperRef,
    onToggleSidebar,
    selectNavItem,
    Header,
    Content,
    navItems,
  } = useDesktopShell();
  return (
    <div className={clsx(styles.root, "desktopShell")}>
      <DesktopSidebar
        active={active}
        ref={wrapperRef}
        selectNavItem={selectNavItem}
        Header={Header}
        Content={Content}
        navItems={navItems}
      />
      <DesktopInset onToggleSidebar={onToggleSidebar} />
    </div>
  );
};
