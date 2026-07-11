import { BellDotIcon } from "lucide-react";
import { useHasPendingRequests } from "@/features/rooms/hooks/useHasPendingRequests";

export const NavIcon = ({
  item,
}: {
  item: { title: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };
}) => {
  const hasPendingRequests = useHasPendingRequests();
  const Icon =
    item.title === "Requests" && hasPendingRequests ? BellDotIcon : item.icon;

  return <Icon size={18} strokeWidth={2} />;
};
