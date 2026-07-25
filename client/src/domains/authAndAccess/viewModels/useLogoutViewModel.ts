import { authControllers } from "@/composition";

export const useLogoutViewModel = () => {
  const logout = () => authControllers.logout();

  return { logout };
};
