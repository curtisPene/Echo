import { DesktopShell } from "./desktopShell/DesktopShell";
import { MobileShell } from "./mobileShell/MobileShell";

export const RootLayout = () => {
  return (
    <main style={{ position: "fixed", height: "100vh", width: "100vw" }}>
      <MobileShell />
      <DesktopShell />
    </main>
  );
};
