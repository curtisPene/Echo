import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";
import { UserRoundPlusIcon } from "lucide-react";
import { useAddContact } from "../hooks/useAddContact";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useState } from "react";

export const AddContactDialog = () => {
  const [open, setOpen] = useState(false);

  const onContactAdded = () => {
    setOpen(false);
  };

  const { onSearch, searchResult, addContact, clearSearch } =
    useAddContact(onContactAdded);

  const onChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(e.target.value);
    },
    500,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) clearSearch();
      }}
    >
      <form>
        <DialogTrigger>
          <UserRoundPlusIcon size={18} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Search by email to connect</DialogDescription>
          </DialogHeader>
          <div className={clsx("dialogContent", "flex flex-col gap-4")}>
            <Input type="email" placeholder="Email" onChange={onChange} />
            <div
              className={clsx(
                "resultsContainer",
                "flex h-14 flex-col justify-center gap-2",
              )}
            >
              {searchResult.status === "idle" && (
                <p className="text-muted-foreground px-1 text-sm">
                  Enter email to search
                </p>
              )}

              {searchResult.status === "searching" && (
                <p className="text-muted-foreground px-1 text-sm">Searching…</p>
              )}
              {searchResult.status === "not_found" && (
                <p className="text-muted-foreground px-1 text-sm">
                  No user found.
                </p>
              )}
              {searchResult.status === "found" && (
                <div className="border-border bg-input/30 flex items-center gap-2 rounded-2xl border p-2">
                  <Avatar>
                    <AvatarFallback className="text-xs">
                      {searchResult.contact.firstName.charAt(0)}
                      {searchResult.contact.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <p className="text-foreground">
                      {searchResult.contact.firstName}
                      {searchResult.contact.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {searchResult.contact.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <Button
              type="button"
              className={clsx("addContactButton", "w-fit self-end px-4")}
              disabled={searchResult.status !== "found"}
              onClick={addContact}
            >
              Add
            </Button>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
