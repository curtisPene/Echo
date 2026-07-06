import { DesktopShell } from "./desktopShell/DesktopShell";
import { MobileShell } from "./mobileShell/MobileShell";
import { useVisualViewportHeight } from "../hooks/useVisualViewportHeight";

export const RootLayout = () => {
  const height = useVisualViewportHeight();

  return (
    <main style={{ position: "fixed", height, width: "100vw" }}>
      <MobileShell />
      <DesktopShell />
    </main>
  );
};
