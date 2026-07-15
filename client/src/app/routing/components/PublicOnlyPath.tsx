import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/stores/useAuth";

export const PublicOnlyPath = ({ children }: { children: ReactNode }) => {
  const status = useAuth((state) => state.authStatus);

  if (status === "authenticated") return <Navigate to="/" />;

  return <>{children}</>;
};
