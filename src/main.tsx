import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { AbonnementProvider } from "../src/components/context/AbonnementContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="light">
      <AbonnementProvider>
        <App />
      </AbonnementProvider>
    </MantineProvider>
  </StrictMode>
);
