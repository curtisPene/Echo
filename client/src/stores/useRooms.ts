import type { Room } from "@/features/rooms/types";
import { create } from "zustand";

type RoomsStore = {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  activeRoom: { id: string; name: string } | null;
  setACtiveRoom: (roomId: string, roomName: string) => void;
  clearActiveRoom: () => void;
};

export const useRooms = create<RoomsStore>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  activeRoom: null,
  setACtiveRoom: (roomId, roomName) =>
    set({ activeRoom: { id: roomId, name: roomName } }),
  clearActiveRoom: () => set({ activeRoom: null }),
}));
