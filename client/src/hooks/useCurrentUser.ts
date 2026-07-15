import { useAuth } from "@/stores/useAuth";

export const useCurrentUser = () => {
  return useAuth((state) => state.user);
};
