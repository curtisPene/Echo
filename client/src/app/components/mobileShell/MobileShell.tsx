import clsx from "clsx";
import styles from "./MobileShell.module.css";
import { MessageCircleIcon, SettingsIcon, UsersRoundIcon } from "lucide-react";
import { Link, Outlet } from "react-router";
import { Composer } from "@/features/messaging/components/composer/Composer";
import { useMobileShellView } from "@/app/hooks/useMobileShellView";

export const MobileShell = () => {
  const { roomId } = useMobileShellView();

  return (
    <div className={clsx(styles.root)}>
      <div className={clsx(styles.inset)}>
        {roomId ? <Composer /> : <Outlet />}
      </div>
      <div className={clsx(styles.navBar)}>
        <Link to="/contacts" className={clsx(styles.navButton)}>
          <UsersRoundIcon width={18} />
        </Link>
        <Link to="/chats" className={clsx(styles.navButton)}>
          <MessageCircleIcon width={18} />
        </Link>
        <Link to="/" className={clsx(styles.navButton)}>
          <SettingsIcon width={18} />
        </Link>
      </div>
    </div>
  );
};
