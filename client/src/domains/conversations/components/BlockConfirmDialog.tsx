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
import type { ParticipantDTO } from "@/domains/conversations/entities/room";
import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";

export const BlockConfirmDialog = ({
  isOpen,
  isBlocking,
  blockTarget,
  onCancel,
  onConfirmBlock,
}: {
  isOpen: boolean;
  isBlocking: boolean;
  blockTarget: ParticipantDTO | null;
  onCancel: () => void;
  onConfirmBlock: (contact: ContactDTO) => void;
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className={clsx("blockConfirmDialog")}>
        <DialogHeader>
          <DialogTitle>Block {blockTarget?.firstName}?</DialogTitle>
          <DialogDescription>
            They won't be able to message you again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={clsx("blockConfirmDialogFooter")}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isBlocking}
            onClick={() => blockTarget && onConfirmBlock(blockTarget)}
          >
            Confirm block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
