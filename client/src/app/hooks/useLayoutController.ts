import { useState } from "react";
import { useNavigate } from "react-router";
import { useDevice } from "@/hooks/useDevice";
import { useActiveRoom } from "@/stores/useActiveRoom";
import type { RoomDTO } from "@/domains/conversations/entities/room";

export type ActivePanel = "conversations" | "notifications";

/**
 * Decides what a layout-affecting intent actually does, given the current
 * device tier - mobile realizes intents via real route navigation, desktop
 * and tablet realize them by updating state the shells read as props.
 */
export const useLayoutController = () => {
  const deviceTier = useDevice();
  const navigate = useNavigate();
  const setActiveRoom = useActiveRoom((state) => state.setActiveRoom);

  const [activePanel, setActivePanel] = useState<ActivePanel>("conversations");
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const viewConversations = () => {
    if (deviceTier === "mobile") {
      navigate("/chats");
      return;
    }

    setActivePanel("conversations");
    setIsDetailsVisible(false);
  };

  const viewNotifications = () => {
    if (deviceTier === "mobile") {
      navigate("/requests");
      return;
    }

    setActivePanel("notifications");
    setIsDetailsVisible(false);
  };

  const selectConversation = (room: RoomDTO) => {
    setActiveRoom(room);

    if (deviceTier === "mobile") {
      navigate(`/chats/${room.id}`);
      return;
    }

    setIsDetailsVisible(false);
  };

  const viewRoomDetails = (roomId: string) => {
    if (deviceTier === "mobile") {
      navigate(`/chats/${roomId}/details`);
      return;
    }

    if (deviceTier === "desktop") {
      // Desktop has its own always-visible details panel - nothing to
      // toggle, viewing details is never a state change there.
      return;
    }

    setIsDetailsVisible(true);
  };

  const hideRoomDetails = (roomId: string) => {
    if (deviceTier === "mobile") {
      navigate(`/chats/${roomId}`);
      return;
    }

    setIsDetailsVisible(false);
  };

  // Profile & settings - desktop realizes this as a modal (isProfileOpen).
  // Mobile's realization (its own nav/route) isn't wired yet.
  const viewProfile = () => {
    setIsProfileOpen(true);
  };

  const hideProfile = () => {
    setIsProfileOpen(false);
  };

  return {
    activePanel,
    isDetailsVisible,
    isProfileOpen,
    viewConversations,
    viewNotifications,
    selectConversation,
    viewRoomDetails,
    hideRoomDetails,
    viewProfile,
    hideProfile,
  };
};
