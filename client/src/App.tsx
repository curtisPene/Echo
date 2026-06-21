import "./App.css";
import { Router } from "./features/routing/Router";
import { useAuth } from "./stores/useAuth";
import { useAppStatus } from "./stores/useAppStatus";
import { SplashScreen } from "./app/components/splashScreen/SplashScreen";
import { useAppBootstrap } from "./app/hooks/useAppBootstrap";
import { useContactsObserver } from "./features/contacts/hooks/useContactsObserver";

function App() {
  const auth = useAuth((state) => state);
  const { authStatus, setAuth } = auth;
  const { appStatus, setAppStatus } = useAppStatus((state) => state);

  console.log("appStatus", appStatus);
  console.log("authStatus", authStatus);

  useAppBootstrap({ appStatus, auth, setAuth, setAppStatus });
  useContactsObserver();

  if (authStatus === "unverified") return <SplashScreen />;

  return <Router />;
}

export default App;
