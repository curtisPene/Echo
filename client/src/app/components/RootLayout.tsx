import { TooltipProvider } from "@/components/ui/tooltip";
import { DesktopShell } from "./DesktopShell";
import { MobileShell } from "./MobileShell";

export const RootLayout = () => {
  return (
    <TooltipProvider>
      <DesktopShell />
      <MobileShell />
    </TooltipProvider>
  );
};
