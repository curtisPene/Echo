import type { Room } from "@/features/rooms/types";
import { create } from "zustand";

type RoomsStore = {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  activeRoom: string | null;
  setACtiveRoom: (roomId: string) => void;
};

export const useRooms = create<RoomsStore>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  activeRoom: null,
  setACtiveRoom: (roomId) => set({ activeRoom: roomId }),
}));
