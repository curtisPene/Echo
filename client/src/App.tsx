import "./App.css";
import { useAuth } from "./stores/useAuth";
import { useAppStatus } from "./stores/useAppStatus";
import { SplashScreen } from "./app/components/splashScreen/SplashScreen";
import { useAppBootstrap } from "./domains/sync/hooks/useAppBootstrap";
import { useSocketState } from "./stores/useSocket";
import { SoundProvider } from "./infrastructure/sound/SoundProvider";
import { Router } from "./app/routing/Router";
import { Toaster } from "./components/ui/sonner";

function App() {
  const auth = useAuth((state) => state);
  const { authStatus } = auth;
  const { appStatus } = useAppStatus((state) => state);
  const { onlineStatus, setOnlineStatus } = useSocketState();

  console.log("AuthStatus: ", authStatus);
  console.log("AppStatus: ", appStatus);

  useAppBootstrap({
    appStatus,
    auth,
    onlineStatus,
    setOnlineStatus,
  });

  if (authStatus === "unverified") return <SplashScreen />;

  return (
    <SoundProvider>
      <Router />
      <Toaster position="top-center" />
    </SoundProvider>
  );
}

export default App;
