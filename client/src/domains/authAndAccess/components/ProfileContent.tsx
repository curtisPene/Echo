import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, LogOutIcon, Trash2Icon } from "lucide-react";
import clsx from "clsx";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useLogoutViewModel } from "@/domains/authAndAccess/viewModels/useLogoutViewModel";
import { useDeleteAccountViewModel } from "@/domains/authAndAccess/viewModels/useDeleteAccountViewModel";
import { getInitials } from "@/lib/utils";

export const ProfileContent = () => {
  const user = useCurrentUser();
  const { isDark, toggleTheme } = useThemeToggle();
  const { logout } = useLogoutViewModel();
  const { isConfirming, openConfirm, cancel, confirmDelete } =
    useDeleteAccountViewModel();

  return (
    <div className={clsx("root", "flex flex-col items-center gap-5")}>
      <div className={clsx("relative flex w-full flex-col items-center gap-2")}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          className={clsx("absolute top-0 right-0")}
        >
          {isDark ? (
            <SunIcon size={16} strokeWidth={2} />
          ) : (
            <MoonIcon size={16} strokeWidth={2} />
          )}
        </Button>
        <Avatar
          size="lg"
          className={clsx("ring-brand", "size-20 rounded-full ring-2")}
        >
          <AvatarFallback className={clsx("text-xl")}>
            {user ? getInitials(user.firstName, user.lastName) : ""}
          </AvatarFallback>
        </Avatar>
        <div className={clsx("flex flex-col items-center gap-1 text-center")}>
          <h2 className={clsx("text-foreground", "text-lg font-semibold")}>
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </h2>
          <p className={clsx("text-muted-foreground", "text-sm")}>
            {user?.email}
          </p>
        </div>
      </div>
      <div className={clsx("flex w-full flex-col gap-2")}>
        <Button
          variant="destructive"
          className={clsx("w-full justify-start gap-2")}
          onClick={() => logout()}
        >
          <LogOutIcon size={16} strokeWidth={2} />
          Log out
        </Button>
        {isConfirming ? (
          <div className={clsx("border-border flex flex-col gap-2 rounded-lg border p-3")}>
            <p className={clsx("text-muted-foreground text-center text-xs")}>
              This will permanently delete your account. Are you sure?
            </p>
            <div className={clsx("flex gap-2")}>
              <Button
                variant="outline"
                className={clsx("flex-1")}
                onClick={cancel}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className={clsx("flex-1")}
                onClick={() => confirmDelete()}
              >
                Confirm delete
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className={clsx(
              "text-muted-foreground hover:text-destructive w-full justify-start gap-2",
            )}
            onClick={openConfirm}
          >
            <Trash2Icon size={16} strokeWidth={2} />
            Delete account
          </Button>
        )}
      </div>
    </div>
  );
};
