import { LoginPage } from "@/features/auth/components/LoginPage";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "../../app/components/RootLayout";
import { PublicOnlyPath } from "@/features/routing/components/PublicOnlyPath";
import { ProtectedPath } from "@/features/routing/components/ProtectedPath";
import { RegistrationPage } from "../auth/components/RegistrationPage";

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
    // children: [
    //   {
    //     path: "/chats",
    //     element: <ConversationList />,
    //     children: [
    //       {
    //         path: "/chats/:roomId",
    //         element: <ConversationList />,
    //       },
    //     ],
    //   },
    //   {
    //     path: "/contacts",
    //     element: <ContactsList />,
    //   },
    // ],
  },
]);
