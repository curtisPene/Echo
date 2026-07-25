import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { ProfileContent } from "@/domains/authAndAccess/components/ProfileContent";
import { useLayoutController } from "@/app/hooks/useLayoutController";

export const ProfileButton = () => {
  const { isProfileOpen, viewProfile, hideProfile } = useLayoutController();

  return (
    <Dialog
      open={isProfileOpen}
      onOpenChange={(open) => (open ? viewProfile() : hideProfile())}
    >
      <DialogTrigger
        render={<button type="button" className="cursor-pointer" />}
      >
        <UserAvatar />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile & settings</DialogTitle>
        </DialogHeader>
        <ProfileContent />
      </DialogContent>
    </Dialog>
  );
};
