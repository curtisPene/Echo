import clsx from "clsx";
import styles from "./Composer.module.css";
import { SendIcon } from "lucide-react";

export const Composer = () => {
  return (
    <div className={clsx(styles.root)}>
      <div className={clsx(styles.chatList)}></div>
      <div className={clsx(styles.inputWrapper)}>
        <input className={clsx(styles.input)} type="text" />
        <button className={clsx(styles.sendButton)}>
          <SendIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
};
