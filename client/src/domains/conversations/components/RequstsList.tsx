import clsx from "clsx";
import { ConversationListItem } from "./ConversationListItem";

export const RequestsList = () => {
  return (
    <div className={clsx("root")}>
      <ul className={clsx("requestsList", "flex w-full flex-col gap-2")}>
      </ul>
    </div>
  );
};
