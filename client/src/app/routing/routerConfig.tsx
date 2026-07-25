import { LoginPage } from "@/domains/authAndAccess/components/LoginPage";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "../../app/components/RootLayout";
import { PublicOnlyPath } from "./components/PublicOnlyPath";
import { RegistrationPage } from "@/domains/authAndAccess/components/RegistrationPage";
import { ProtectedPath } from "./components/ProtectedPath";
import { ConversationsList } from "@/domains/conversations/components/ConversationList";
import { ConversationScreen } from "@/domains/messaging/components/ConversationScreen";
import { ConversationDetailsContent } from "@/domains/conversations/components/ConversationDetailsContent";
import { RequestsList } from "@/domains/conversations/components/RequstsList";
import { ProfileContent } from "@/domains/authAndAccess/components/ProfileContent";

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
        element: <ConversationScreen />,
      },
      {
        path: "/chats/:roomId/details",
        element: <ConversationDetailsContent />,
      },
      {
        path: "/requests",
        element: <RequestsList />,
      },
      {
        path: "/profile",
        element: <ProfileContent />,
      },
    ],
    hydrateFallbackElement: <div>Loading...</div>,
  },
]);
