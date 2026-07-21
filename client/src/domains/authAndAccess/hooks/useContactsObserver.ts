import { getContactsService } from "@/composition";
import { liveQuery } from "dexie";
import { type AppStatus } from "@/stores/useAppStatus";
import { useEffect } from "react";
import { useContacts } from "@/stores/useContacts";

export const useContactsObserver = ({
  appStatus,
}: {
  appStatus: AppStatus;
}) => {
  const setContacts = useContacts((state) => state.setContacts);

  useEffect(() => {
    if (appStatus !== "synced") return;
    const subscription = liveQuery(() => {
      return getContactsService.execute();
    }).subscribe((contacts) => {
      setContacts(contacts);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appStatus, setContacts]);
};
