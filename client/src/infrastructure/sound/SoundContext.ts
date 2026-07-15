import { createContext } from "react";

type SoundContextValue = {
  playSound: (name: string) => void;
  muted: boolean;
  setMuted: (value: boolean) => void;
};

export const SoundContext = createContext<SoundContextValue | null>(null);
