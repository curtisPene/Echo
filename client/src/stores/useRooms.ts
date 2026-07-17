import type { RoomDTO } from "@/domains/conversations/types";
import { create } from "zustand";

type RoomsStore = {
  rooms: RoomDTO[];
  setRooms: (rooms: RoomDTO[]) => void;
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
