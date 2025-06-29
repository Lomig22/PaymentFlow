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
