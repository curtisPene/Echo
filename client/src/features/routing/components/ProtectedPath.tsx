import { useAuth } from "@/stores/useAuth";
import { type ReactNode } from "react";
import { Navigate } from "react-router";

export const ProtectedPath = ({ children }: { children: ReactNode }) => {
  const { authStatus } = useAuth((state) => state);

  if (authStatus !== "authenticated") return <Navigate to="/login" />;

  return <>{children}</>;
};
