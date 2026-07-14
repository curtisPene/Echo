import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/stores/useAuth";
import clsx from "clsx";

export const UserAvatar = ({ className }: { className?: string }) => {
  const user = useAuth((state) => state.user);

  return (
    <Avatar className={clsx("ring-brand rounded-full ring-2", className)}>
      <AvatarFallback>
        {user?.firstName.charAt(0)}
        {user?.lastName.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};
