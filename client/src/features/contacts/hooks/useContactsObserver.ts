import { db } from "@/lib/db";
import { liveQuery } from "dexie";
import { type AppStatus } from "@/stores/useAppStatus";
import { useEffect } from "react";
import { useContacts } from "@/stores/useContacts";

export const useContactsObserver = ({
  appStatus,
}: {
  appStatus: AppStatus;
}) => {
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
