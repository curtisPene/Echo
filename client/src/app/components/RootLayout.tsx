import { TooltipProvider } from "@/components/ui/tooltip";
import { DesktopShell } from "./DesktopShell";

export const RootLayout = () => {
  return (
    <TooltipProvider>
      <DesktopShell />
    </TooltipProvider>
  );
};
