import { LoginPage } from "@/domains/auth & access/components/LoginPage";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "../../app/components/RootLayout";
import { PublicOnlyPath } from "./components/PublicOnlyPath";
import { RegistrationPage } from "@/domains/auth & access/components/RegistrationPage";
import { ProtectedPath } from "./components/ProtectedPath";
import { ConversationsList } from "@/domains/conversation/components/ConversationList";
import { MobileChatScreen } from "@/domains/messaging/components/MobileChatScreen";
import { RequestsList } from "@/domains/conversation/components/RequstsList";
import { ProfilePage } from "@/domains/auth & access/components/ProfilePage";

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
    children: [
      {
        index: true,
        element: <Navigate to="/chats" replace />,
      },
      {
        path: "/chats",
        element: <ConversationsList />,
      },
      {
        path: "/chats/:roomId",
        element: <MobileChatScreen />,
      },
      {
        path: "/requests",
        element: <RequestsList />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
    hydrateFallbackElement: <div>Loading...</div>,
  },
]);
