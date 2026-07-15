import { db } from "@/infrastructure/sync/db";
import { type AppStatus } from "@/stores/useAppStatus";
import { useRoomUnreadCounts } from "@/stores/useRoomUnreadCounts";
import { liveQuery } from "dexie";
import { useEffect } from "react";

export const useRoomUnreadCountsObserver = ({
  appStatus,
}: {
  appStatus: AppStatus;
}) => {
  const setUnreadCounts = useRoomUnreadCounts((state) => state.setUnreadCounts);

  useEffect(() => {
    if (appStatus !== "synced") return;
    const subscription = liveQuery(() =>
      db.roomUnreadCounts.toArray(),
    ).subscribe((unreadCounts) => {
      setUnreadCounts(unreadCounts);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appStatus, setUnreadCounts]);
};
