import { BellDotIcon } from "lucide-react";
import { useHasPendingRequests } from "@/features/rooms/hooks/useHasPendingRequests";
import type { Title } from "@/app/hooks/useLayoutController";

export const NavIcon = ({
  navKey,
  item,
}: {
  navKey: Title;
  item: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };
}) => {
  const hasPendingRequests = useHasPendingRequests();
  const Icon =
    navKey === "requests" && hasPendingRequests ? BellDotIcon : item.icon;

  return <Icon size={18} strokeWidth={2} />;
};
