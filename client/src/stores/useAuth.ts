import { create } from "zustand";
import type { User } from "@/domains/auth & access/types";

export type AuthStatus = "unauthenticated" | "authenticated" | "unverified";

export type Auth =
  | { authStatus: Exclude<AuthStatus, "authenticated">; user: null }
  | { authStatus: "authenticated"; user: User; accessToken: string };

type AuthStore = Auth & {
  setAuth: (auth: Auth) => void;
};

export const useAuth = create<AuthStore>((set) => ({
  authStatus: "unverified",
  accessToken: null,
  user: null,
  setAuth: (auth) => set(auth),
}));
