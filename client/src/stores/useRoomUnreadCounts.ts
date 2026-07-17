import type { RoomUnreadCount } from "@/domains/conversations/types";
import { create } from "zustand";

type RoomUnreadCountsStore = {
  unreadCounts: RoomUnreadCount[];
  setUnreadCounts: (unreadCounts: RoomUnreadCount[]) => void;
};

export const useRoomUnreadCounts = create<RoomUnreadCountsStore>((set) => ({
  unreadCounts: [],
  setUnreadCounts: (unreadCounts) => set({ unreadCounts }),
}));
