import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import clsx from "clsx";

export const LeaveGroupDialog = ({
  isOpen,
  isLeaving,
  onOpenChange,
  onConfirmLeave,
}: {
  isOpen: boolean;
  isLeaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmLeave: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={clsx("leaveGroupDialog")}>
        <DialogHeader>
          <DialogTitle>Leave this chat?</DialogTitle>
          <DialogDescription>
            You'll stop receiving new messages, and you'll need to be added
            back to rejoin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={clsx("leaveGroupDialogFooter")}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLeaving}
            onClick={onConfirmLeave}
          >
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
