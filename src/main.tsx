// Reload automatique si un chunk JS ne se charge pas (ex: après déploiement)
if (typeof window !== "undefined") {
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
import CalendlyAndChatlingLoader from "../src/components/CalendlyAndChatlingLoader"
import { AbonnementProvider } from "../src/components/context/AbonnementContext.tsx";
import AppWithMFA from "./App.tsx";
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
