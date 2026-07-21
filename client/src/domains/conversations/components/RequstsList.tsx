import clsx from "clsx";

export const RequestsList = () => {
  return (
    <div className={clsx("root")}>
      <ul className={clsx("requestsList", "flex w-full flex-col gap-2")}>
      </ul>
    </div>
  );
};
