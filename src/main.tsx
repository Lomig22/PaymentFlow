// Reload automatique si un chunk JS ne se charge pas (ex: après déploiement)
declare global {
  interface Window { __pfErrorListenerAdded?: boolean }
}
if (typeof window !== "undefined" && !window.__pfErrorListenerAdded) {
  window.__pfErrorListenerAdded = true;
  window.addEventListener("error", (event: any) => {
    if (event?.message && event.message.includes("Loading chunk")) {
      window.location.reload();
    }
    if (
      event?.type === "error" &&
      event?.target?.tagName === "SCRIPT" &&
      event?.target?.src &&
      event?.target?.src.includes("assets/")
    ) {
      window.location.reload();
    }
  });
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import CalendlyAndChatlingLoader from "../components/CalendlyAndChatlingLoader"
import { AbonnementProvider } from "../components/context/AbonnementContext";
import AppWithMFA from "./App";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <MantineProvider defaultColorScheme="light">
        <CalendlyAndChatlingLoader />
        <AbonnementProvider>
          <AppWithMFA />
        </AbonnementProvider>
      </MantineProvider>
    </HelmetProvider>
  </StrictMode>
);
