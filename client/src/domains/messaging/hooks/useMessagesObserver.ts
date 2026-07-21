import { getMessagesService } from "@/composition";
import { type AppStatus } from "@/stores/useAppStatus";
import { useMessages } from "@/stores/useMessages";
import { liveQuery } from "dexie";
import { useEffect } from "react";

export const useMessagesObserver = ({
  appStatus,
}: {
  appStatus: AppStatus;
}) => {
  const setMessages = useMessages((state) => state.setMessages);

  useEffect(() => {
    if (appStatus !== "synced") return;
    const subscription = liveQuery(() => {
      return getMessagesService.execute();
    }).subscribe((messages) => {
      setMessages(messages);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appStatus, setMessages]);
};
