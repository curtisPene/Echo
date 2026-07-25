import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import clsx from "clsx";
import { getInitials } from "@/lib/utils";
import { useSearchLocalContactsViewModel } from "@/domains/conversations/viewModels/useSearchLocalContactsViewModel";
import { useAddParticipantViewModel } from "@/domains/conversations/viewModels/useAddParticipantViewModel";

export const AddParticipantDialog = ({
  isOpen,
  onOpenChange,
  roomId,
  isParticipant,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  isParticipant: (userId: string) => boolean;
}) => {
  const { query, setQuery, results, error, isSearching, search } =
    useSearchLocalContactsViewModel();
  const { isAdding, addParticipant } = useAddParticipantViewModel();

  const close = () => {
    onOpenChange(false);
    setQuery("");
  };

  const handleAddParticipant = async (userId: string) => {
    const result = await addParticipant(roomId, userId);
    if (result.success) close();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (open ? onOpenChange(true) : close())}
    >
      <DialogContent className={clsx("addParticipantDialog", "gap-4")}>
        <DialogHeader>
          <DialogTitle>Add someone to the chat</DialogTitle>
          <DialogDescription>
            Search your contacts by email to find who you'd like to add.
          </DialogDescription>
        </DialogHeader>
        <div className={clsx("addParticipantDialogBody", "flex flex-col gap-4")}>
          <form
            className={clsx("addParticipantSearchForm", "flex gap-2")}
            onSubmit={(event) => {
              event.preventDefault();
              search();
            }}
          >
            <Input
              type="email"
              placeholder="Email address"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button type="submit" disabled={isSearching || !query}>
              Search
            </Button>
          </form>
          {error && (
            <p
              className={clsx(
                "addParticipantSearchError",
                "text-destructive px-1 text-xs",
              )}
            >
              {error}
            </p>
          )}
          {results.length > 0 && (
            <ul className={clsx("addParticipantResults", "flex flex-col gap-1")}>
              {results.map((foundContact) => {
                const alreadyMember = isParticipant(foundContact.userId);
                return (
                  <li
                    key={foundContact.userId}
                    className={clsx(
                      "addParticipantResultRow",
                      "bg-brand/10",
                      "flex items-center gap-2 rounded-lg p-2",
                    )}
                  >
                    <Avatar className={clsx("size-8 rounded-full")}>
                      <AvatarFallback className={clsx("text-xs")}>
                        {getInitials(
                          foundContact.firstName,
                          foundContact.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className={clsx("text-foreground", "flex-1 text-sm")}>
                      {foundContact.firstName} {foundContact.lastName}
                    </span>
                    <Button
                      size="sm"
                      variant={alreadyMember ? "outline" : "default"}
                      disabled={alreadyMember || isAdding}
                      onClick={() => handleAddParticipant(foundContact.userId)}
                    >
                      {alreadyMember ? "Already in chat" : "Add"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
