import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";

export const ProfilePage = () => {
  return (
    <div className={clsx("root", "flex flex-col items-center gap-4 p-6")}>
      <Avatar
        size="lg"
        className={clsx("ring-brand", "size-20 rounded-full ring-2")}
      >
        <AvatarFallback className={clsx("text-xl")}></AvatarFallback>
      </Avatar>
      <div className={clsx("flex flex-col items-center gap-1 text-center")}>
        <h2 className={clsx("text-foreground", "text-lg font-semibold")}></h2>
        <p className={clsx("text-muted-foreground", "text-sm")}></p>
      </div>
    </div>
  );
};
