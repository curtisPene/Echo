import { useRef, useState } from "react";
import { SoundContext } from "./SoundContext";

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [muted, setMuted] = useState(false);
  const soundsRef = useRef<Record<string, HTMLAudioElement>>({
    "new-message": new Audio("/sounds/newMessage.mp3"),
  });

  const playSound = (name: string) => {
    if (!muted) {
      const sound = soundsRef.current[name];
      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }
    }
  };

  return (
    <SoundContext value={{ playSound, muted, setMuted }}>
      {children}
    </SoundContext>
  );
};
