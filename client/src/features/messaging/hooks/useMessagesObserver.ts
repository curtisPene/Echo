import { db } from "@/lib/db";
import { useAppStatus } from "@/stores/useAppStatus";
import { useMessages } from "@/stores/useMessages";
import { liveQuery } from "dexie";
import { useEffect } from "react";

export const useMessagesObserver = () => {
  const { setMessages } = useMessages();
  const { appStatus } = useAppStatus();

  useEffect(() => {
    if (appStatus !== "synced") return;
    const subscription = liveQuery(() => {
      return db.messages.toArray();
    }).subscribe((messages) => {
      setMessages(messages);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appStatus, setMessages]);
};
