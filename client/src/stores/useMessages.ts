import type { Message } from "@/features/messaging/types";
import { create } from "zustand";

type MessageStore = {
  messages: Message[];
  roomId: string;
  setMessages: (messages: Message[]) => void;
  setRoomId: (roomId: string) => void;
};

export const useMessages = create<MessageStore>((set) => ({
  messages: [],
  roomId: "",
  setMessages: (messages) => set({ messages }),
  setRoomId: (roomId) => set({ roomId }),
}));
