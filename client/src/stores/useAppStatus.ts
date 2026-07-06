import { create } from "zustand";

export type AppStatus = "idle" | "syncing" | "syncFail" | "synced";

type AppStatusStore = {
  appStatus: AppStatus;
  setAppStatus: (appStatus: AppStatus) => void;
};

export const useAppStatus = create<AppStatusStore>((set) => ({
  appStatus: "idle",
  setAppStatus: (appStatus) => set({ appStatus }),
}));
