import { DesktopShell } from "./desktopShell/DesktopShell";
import { MobileShell } from "./mobileShell/MobileShell";

export const RootLayout = () => {
  return (
    <main style={{ position: "fixed", inset: 0 }}>
      <MobileShell />
      <DesktopShell />
    </main>
  );
};
