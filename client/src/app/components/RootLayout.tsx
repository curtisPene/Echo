import { DesktopShell } from "./desktopShell/DesktopShell";
import { MobileShell } from "./mobileShell/MobileShell";

export const RootLayout = () => {
  return (
    <main style={{ position: "fixed", height: "100dvh", width: "100vw" }}>
      <MobileShell />
      <DesktopShell />
    </main>
  );
};
