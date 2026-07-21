import type { MessageDTO } from "@/domains/messaging/entities/message";
import { create } from "zustand";

type MessageStore = {
  messages: MessageDTO[];
  setMessages: (messages: MessageDTO[]) => void;
};

export const useMessages = create<MessageStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
}));
