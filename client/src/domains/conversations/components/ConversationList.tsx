import clsx from "clsx";

export const ConversationsList = () => {
  return (
    <div className={clsx("root")}>
      <ul className={clsx("conversationList", "flex w-full flex-col gap-2")}>
      </ul>
    </div>
  );
};
