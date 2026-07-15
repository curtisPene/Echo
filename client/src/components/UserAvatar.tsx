import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getInitials } from "@/lib/utils";
import clsx from "clsx";

export const UserAvatar = ({ className }: { className?: string }) => {
  const user = useCurrentUser();

  return (
    <Avatar className={clsx("ring-brand rounded-full ring-2", className)}>
      <AvatarFallback>
        {user ? getInitials(user.firstName, user.lastName) : ""}
      </AvatarFallback>
    </Avatar>
  );
};
