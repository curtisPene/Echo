import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./app/components/errorBoundary/ErrorBoundary.tsx";
import { GlobalErrorWatcher } from "./app/components/errorBoundary/GlobalErrorWatcher.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <GlobalErrorWatcher />
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
