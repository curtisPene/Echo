import type { RoomDTO } from "@/domains/conversations/domainModels/room";
import { create } from "zustand";

type RoomsStore = {
  rooms: RoomDTO[];
  setRooms: (rooms: RoomDTO[]) => void;
  activeRoom: RoomDTO | null;
  setActiveRoom: (room: RoomDTO) => void;
  clearActiveRoom: () => void;
};

export const useRooms = create<RoomsStore>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  activeRoom: null,
  setActiveRoom: (room) => set({ activeRoom: room }),
  clearActiveRoom: () => set({ activeRoom: null }),
}));
