import { create } from "zustand";

type PresenceStore = {
  onlineUserIds: Record<string, boolean>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
};

export const usePresence = create<PresenceStore>((set) => ({
  onlineUserIds: {},
  setOnline: (userId) =>
    set((state) => ({
      onlineUserIds: { ...state.onlineUserIds, [userId]: true },
    })),
  setOffline: (userId) =>
    set((state) => ({
      onlineUserIds: { ...state.onlineUserIds, [userId]: false },
    })),
}));
