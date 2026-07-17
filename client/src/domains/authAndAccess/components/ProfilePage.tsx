import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getInitials } from "@/lib/utils";
import clsx from "clsx";

export const ProfilePage = () => {
  const user = useCurrentUser();

  if (!user) return null;

  return (
    <div className={clsx("root", "flex flex-col items-center gap-4 p-6")}>
      <Avatar
        size="lg"
        className={clsx("ring-brand", "size-20 rounded-full ring-2")}
      >
        <AvatarFallback className={clsx("text-xl")}>
          {getInitials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className={clsx("flex flex-col items-center gap-1 text-center")}>
        <h2 className={clsx("text-foreground", "text-lg font-semibold")}>
          {user.firstName} {user.lastName}
        </h2>
        <p className={clsx("text-muted-foreground", "text-sm")}>
          {user.email}
        </p>
      </div>
    </div>
  );
};
