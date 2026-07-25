import { useLocation, useNavigate, useParams } from "react-router";
import { useActiveRoom } from "@/stores/useActiveRoom";

const STATIC_TITLES: Record<string, string> = {
  "/chats": "Chats",
  "/requests": "Requests",
  "/profile": "Profile & settings",
};

/**
 * Derives the mobile header's title and back-button behavior purely from
 * the current route - mobile is fully route-driven, so "what screen am I
 * on" and "what should the header say" are the same question. Not a VM:
 * there's no user flow here, just reading where the router already put us.
 */
export const useMobileHeader = () => {
  const { pathname } = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const activeRoom = useActiveRoom((state) => state.activeRoom);

  const isDetailsScreen = pathname.endsWith("/details") && !!roomId;
  const isRoomScreen = pathname.startsWith("/chats/") && !!roomId && !isDetailsScreen;

  const title = isDetailsScreen
    ? "Details"
    : isRoomScreen
      ? (activeRoom?.name ?? "")
      : (STATIC_TITLES[pathname] ?? "Chats");

  const showBackButton = isRoomScreen || isDetailsScreen;
  const showRoomDetailsButton = isRoomScreen;

  const goBack = () => {
    if (isDetailsScreen) {
      navigate(`/chats/${roomId}`);
      return;
    }

    navigate("/chats");
  };

  const viewRoomDetails = () => {
    navigate(`/chats/${roomId}/details`);
  };

  return {
    title,
    showBackButton,
    showRoomDetailsButton,
    goBack,
    viewRoomDetails,
  };
};
