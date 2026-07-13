import { LoginPage } from "@/features/auth/components/LoginPage";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "../../app/components/RootLayout";
import { PublicOnlyPath } from "@/features/routing/components/PublicOnlyPath";
import { ProtectedPath } from "@/features/routing/components/ProtectedPath";
import { RegistrationPage } from "../auth/components/RegistrationPage";
import { ConversationsList } from "../rooms/components/ConversationList";
import { MobileChatScreen } from "../messaging/components/MobileChatScreen";
import { ContactsList } from "../contacts/components/ContactsList";
import { RequestsList } from "../rooms/components/RequstsList";

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
        path: "/contacts",
        element: <ContactsList />,
      },
      {
        path: "/requests",
        element: <RequestsList />,
      },
      {
        path: "/settings",
        element: <div>Settings</div>,
      },
    ],
    hydrateFallbackElement: <div>Loading...</div>,
  },
]);
