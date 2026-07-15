import { getRoomsService } from "@/domains/conversation/services/getRoomsService";
import { type AppStatus } from "@/stores/useAppStatus";
import { useRooms } from "@/stores/useRooms";
import { liveQuery } from "dexie";
import { useEffect } from "react";

export const useRoomsObserver = ({ appStatus }: { appStatus: AppStatus }) => {
  const setRooms = useRooms((state) => state.setRooms);

  useEffect(() => {
    if (appStatus !== "synced") return;
    const subscription = liveQuery(() => getRoomsService()).subscribe(
      (rooms) => {
        setRooms(rooms);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [appStatus, setRooms]);
};
