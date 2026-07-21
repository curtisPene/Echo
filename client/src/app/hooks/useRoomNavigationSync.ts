import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDevice } from "@/hooks/useDevice";
import { useActiveRoom } from "@/stores/useActiveRoom";

export const useRoomNavigationSync = () => {
  const deviceTier = useDevice();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const activeRoom = useActiveRoom((state) => state.activeRoom);

  useEffect(() => {
    if (deviceTier === "mobile") {
      if (activeRoom) navigate(`/chats/${activeRoom.id}`);
      return;
    }

    if (pathname.startsWith("/chats/")) navigate("/chats");
  }, [deviceTier, activeRoom, pathname, navigate]);
};
