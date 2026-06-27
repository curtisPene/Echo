import { db } from "@/lib/db";
import { type AppStatus } from "@/stores/useAppStatus";
import { useRooms } from "@/stores/useRooms";
import { liveQuery } from "dexie";
import { useEffect } from "react";

export const useRoomsObserver = ({ appStatus }: { appStatus: AppStatus }) => {
  const { setRooms } = useRooms();

  useEffect(() => {
    if (appStatus !== "synced") return;
    const subscription = liveQuery(() => {
      return db.rooms.toArray();
    }).subscribe((rooms) => {
      setRooms(rooms);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appStatus, setRooms]);
};
