import { useRooms } from "@/stores/useRooms";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

export const useMobileShellView = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const activeRoom = useRooms((state) => state.activeRoom);
  const roomRef = useRef<string>(null);
  useEffect(() => {
    if (!activeRoom) return;
    navigate("/chats/" + activeRoom.id);
    roomRef.current = activeRoom.id;
  }, [activeRoom, navigate]);

  return { roomId };
};
