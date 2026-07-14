import { useEffect, useState } from "react";

export type DeviceTier = "mobile" | "tablet" | "desktop";

const getDeviceTier = (): DeviceTier => {
  if (window.matchMedia("(max-width: 639px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
  return "desktop";
};

export const useDevice = () => {
  const [deviceTier, setDeviceTier] = useState<DeviceTier>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const deviceTier = getDeviceTier();
      setDeviceTier(deviceTier);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return deviceTier;
};
