import type { RoomDTO } from "@/domains/conversations/entities/room";
import { create } from "zustand";

type ActiveRoomStore = {
  activeRoom: RoomDTO | null;
  setActiveRoom: (room: RoomDTO) => void;
  clearActiveRoom: () => void;
};

export const useActiveRoom = create<ActiveRoomStore>((set) => ({
  activeRoom: null,
  setActiveRoom: (room) => set({ activeRoom: room }),
  clearActiveRoom: () => set({ activeRoom: null }),
}));
