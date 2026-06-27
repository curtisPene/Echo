import { create } from "zustand";

type GlobalErrorStore = {
  error: Error | null;
  setError: (error: Error) => void;
};

export const useGlobalError = create<GlobalErrorStore>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));
