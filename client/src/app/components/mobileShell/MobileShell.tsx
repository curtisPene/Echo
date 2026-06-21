import clsx from "clsx";
import styles from "./MobileShell.module.css";
import { MessageCircleIcon, SettingsIcon, UsersRoundIcon } from "lucide-react";

export const MobileShell = () => {
  return (
    <div className={clsx(styles.root, "mobileShell")}>
      <div className={clsx(styles.inset, "inset")}></div>
      <div className={clsx(styles.navBar, "content")}>
        <button className={clsx(styles.navButton, "navButton")}>
          <UsersRoundIcon width={18} />
        </button>
        <button className={clsx(styles.navButton, "navButton")}>
          <MessageCircleIcon width={18} />
        </button>
        <button className={clsx(styles.navButton, "navButton")}>
          <SettingsIcon width={18} />
        </button>
      </div>
    </div>
  );
};
