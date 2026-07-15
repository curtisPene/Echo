import "./App.css";
import { useAuth } from "./stores/useAuth";
import { useAppStatus } from "./stores/useAppStatus";
import { SplashScreen } from "./app/components/splashScreen/SplashScreen";
import { useAppBootstrap } from "./app/hooks/useAppBootstrap";
import { useContactsObserver } from "./domains/conversation/hooks/useContactsObserver";
import { useRoomsObserver } from "./domains/presence/hooks/useRoomsObserver";
import { useRoomUnreadCountsObserver } from "./domains/presence/hooks/useRoomUnreadCountsObserver";
import { useMessagesObserver } from "./domains/messaging/hooks/useMessagesObserver";
import { useSocketState } from "./stores/useSocket";
import { SoundProvider } from "./infrastructure/sound/SoundProvider";
import { Router } from "./app/routing/Router";

function App() {
  const auth = useAuth((state) => state);
  const { authStatus, setAuth } = auth;
  const { appStatus, setAppStatus } = useAppStatus((state) => state);
  const { onlineStatus, setOnlineStatus } = useSocketState();

  useAppBootstrap({
    appStatus,
    auth,
    setAuth,
    setAppStatus,
    onlineStatus,
    setOnlineStatus,
  });
  useContactsObserver({ appStatus });
  useRoomsObserver({ appStatus });
  useRoomUnreadCountsObserver({ appStatus });
  useMessagesObserver({ appStatus });

  if (authStatus === "unverified") return <SplashScreen />;

  return (
    <SoundProvider>
      <Router />
    </SoundProvider>
  );
}

export default App;
