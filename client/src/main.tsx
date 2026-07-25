import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./app/components/errorBoundary/ErrorBoundary.tsx";

const storedTheme = localStorage.getItem("theme");
const isDark =
  storedTheme === "dark" ||
  (storedTheme !== "light" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark", isDark);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
