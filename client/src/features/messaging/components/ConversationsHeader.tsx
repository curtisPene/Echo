import { SquarePenIcon } from "lucide-react";
import styles from "./ConversationsHeader.module.css";
import clsx from "clsx";
import { Button } from "@/components/button/Button";

export const ConversationsHeader = () => {
  return (
    <div className={clsx(styles.root, "conversationsHeader")}>
      <span>Conversations</span>
      <div>
        <Button variant="icon" className={clsx(styles.toggleButton)}>
          <SquarePenIcon width={18} height={18} />
        </Button>
      </div>
    </div>
  );
};
