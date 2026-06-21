import { create } from "zustand";

export type OnlineStatus = "online" | "offline";

type SocketStore = {
  onlineStatus: OnlineStatus;
  setOnlineStatus: (isConnected: OnlineStatus) => void;
};

export const useSocketState = create<SocketStore>((set) => ({
  onlineStatus: "offline",
  setOnlineStatus: (isConnected) => set({ onlineStatus: isConnected }),
}));
