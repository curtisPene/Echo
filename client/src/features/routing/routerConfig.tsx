import { LoginPage } from "@/features/auth/components/LoginPage";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "../../app/components/RootLayout";
import { RegistrationPage } from "@/features/auth/components/RegistrationPage";
import { PublicOnlyPath } from "@/features/routing/components/PublicOnlyPath";
import { ProtectedPath } from "@/features/routing/components/ProtectedPath";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyPath>
        <LoginPage />
      </PublicOnlyPath>
    ),
    hydrateFallbackElement: <div>Loading...</div>,
  },
  {
    path: "/register",
    element: (
      <PublicOnlyPath>
        <RegistrationPage />
      </PublicOnlyPath>
    ),
    hydrateFallbackElement: <div>Loading...</div>,
  },
  {
    path: "/",
    element: (
      <ProtectedPath>
        <RootLayout />
      </ProtectedPath>
    ),
    hydrateFallbackElement: <div>Loading...</div>,
    children: [],
  },
]);
