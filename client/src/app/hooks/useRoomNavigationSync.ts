import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDevice } from "@/hooks/useDevice";
import { useRooms } from "@/stores/useRooms";

export const useRoomNavigationSync = () => {
  const deviceTier = useDevice();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const activeRoom = useRooms((state) => state.activeRoom);

  useEffect(() => {
    if (deviceTier === "mobile") {
      if (activeRoom) navigate(`/chats/${activeRoom.id}`);
      return;
    }

    if (pathname.startsWith("/chats/")) navigate("/chats");
  }, [deviceTier, activeRoom, pathname, navigate]);
};
