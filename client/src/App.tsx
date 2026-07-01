import "./App.css";
import { Router } from "./features/routing/Router";
import { useAuth } from "./stores/useAuth";
import { useAppStatus } from "./stores/useAppStatus";
import { SplashScreen } from "./app/components/splashScreen/SplashScreen";
import { useAppBootstrap } from "./app/hooks/useAppBootstrap";
import { useContactsObserver } from "./features/contacts/hooks/useContactsObserver";
import { useRoomsObserver } from "./features/rooms/hooks/useRoomsObserver";
import { useMessagesObserver } from "./features/messaging/hooks/useMessagesObserver";
import { useSocketState } from "./stores/useSocket";
import { SoundProvider } from "./app/hooks/SoundProvider";

function App() {
  const auth = useAuth((state) => state);
  const { authStatus, setAuth } = auth;
  const { appStatus, setAppStatus } = useAppStatus((state) => state);
  const { onlineStatus, setOnlineStatus } = useSocketState();

  console.log("appStatus: ", appStatus);
  console.log("authStatus: ", authStatus);

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
  useMessagesObserver({ appStatus });

  if (authStatus === "unverified") return <SplashScreen />;

  return (
    <SoundProvider>
      <Router />
    </SoundProvider>
  );
}

export default App;
