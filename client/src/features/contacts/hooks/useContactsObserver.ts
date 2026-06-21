import { db } from "@/lib/db";
import { liveQuery } from "dexie";
import { useAppStatus } from "@/stores/useAppStatus";
import { useEffect } from "react";
import { useContacts } from "@/stores/useContacts";

export const useContactsObserver = () => {
  const { appStatus } = useAppStatus();
  const { setContacts } = useContacts();

  useEffect(() => {
    if (appStatus !== "synced") return;
    const subscription = liveQuery(() => {
      return db.contacts.toArray();
    }).subscribe((contacts) => {
      setContacts(contacts);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appStatus, setContacts]);
};
