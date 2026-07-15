import { useRooms } from "@/stores/useRooms";
import { useState } from "react";
import { useLocation } from "react-router";

export const useDesktopShellView = () => {
  const pathname = useLocation().pathname;
  const activeRoom = useRooms((state) => state.activeRoom);
  const [isDetailsVisible, setIsDetailsVisible] = useState<boolean>(false);

  let listHeader: string;

  if (pathname.startsWith("/chats")) listHeader = "Chats";
  else if (pathname.startsWith("/requests")) {
    listHeader = "Requests";
  } else if (pathname.startsWith("/profile")) {
    listHeader = "Profile";
  } else listHeader = "";

  return { listHeader, activeRoom, isDetailsVisible, setIsDetailsVisible };
};
