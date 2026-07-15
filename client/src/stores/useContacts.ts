import type { Contact } from "@/domains/conversation/types";
import { create } from "zustand";

export type ContactsStore = {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
};

export const useContacts = create<ContactsStore>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
}));
