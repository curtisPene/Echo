import { useContext } from "react";
import { SoundContext } from "./SoundContext";

export const useSoundProvider = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSoundProvider must be used within a SoundProvider");
  }
  return context;
};
