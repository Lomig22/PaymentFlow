import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { AbonnementProvider } from "../src/components/context/AbonnementContext.tsx";
import AppWithMFA from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="light">
      <AbonnementProvider>
        <AppWithMFA />
      </AbonnementProvider>
    </MantineProvider>
  </StrictMode>
);
