import { TooltipProvider } from "@/components/ui/tooltip";
import { DesktopShell } from "./DesktopShell";
import { MobileShell } from "./MobileShell";
import { useRoomNavigationSync } from "../hooks/useRoomNavigationSync";

export const RootLayout = () => {
  useRoomNavigationSync();

  return (
    <TooltipProvider>
      <DesktopShell />
      <MobileShell />
    </TooltipProvider>
  );
};
