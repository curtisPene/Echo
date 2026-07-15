import type { Message } from "@/domains/messaging/types";
import { create } from "zustand";

type MessageStore = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
};

export const useMessages = create<MessageStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
}));
