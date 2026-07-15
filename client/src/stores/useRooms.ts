import type { Room } from "@/domains/presence/types";
import { create } from "zustand";

type RoomsStore = {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  activeRoom: { id: string; name: string } | null;
  setACtiveRoom: (room: { id: string; name: string }) => void;
  clearActiveRoom: () => void;
};

export const useRooms = create<RoomsStore>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  activeRoom: null,
  setACtiveRoom: (room: { id: string; name: string }) =>
    set({ activeRoom: { id: room.id, name: room.name } }),
  clearActiveRoom: () => set({ activeRoom: null }),
}));
