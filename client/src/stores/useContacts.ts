import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";
import { create } from "zustand";

export type ContactsStore = {
  contacts: ContactDTO[];
  setContacts: (contacts: ContactDTO[]) => void;
};

export const useContacts = create<ContactsStore>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
}));
