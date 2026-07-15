import type { Contact } from "@/domains/contacts/types";
import { create } from "zustand";

export type ContactsStore = {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
};

export const useContacts = create<ContactsStore>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
}));
