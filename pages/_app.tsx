import "../styles/globals.css";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { HelmetProvider } from "react-helmet-async";
import CalendlyAndChatlingLoader from "../src/components/CalendlyAndChatlingLoader";
import { AbonnementProvider } from "../src/components/context/AbonnementContext";
import AppWithMFA from "../src/App";
import { User } from "@supabase/supabase-js";
import { UserProvider } from "../components/context/UserContext";
import AppHeader from "../src/components/AppHeader";

function MyApp({ Component, pageProps }: AppProps) {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        if (!window.__pfErrorListenerAdded) {
            window.__pfErrorListenerAdded = true;
            window.addEventListener("error", (event: any) => {
                if (event?.message?.includes("Loading chunk")) {
                    window.location.reload();
                }
                if (
                    event?.type === "error" &&
                    event?.target?.tagName === "SCRIPT" &&
                    event?.target?.src?.includes("assets/")
                ) {
                    window.location.reload();
                }
            });
        }
    }, []);

    return (
        <HelmetProvider>
            <MantineProvider defaultColorScheme="light">
                <CalendlyAndChatlingLoader />
                <AbonnementProvider>
                    <UserProvider>
                        <AppHeader user={user} onContactClick={() => { }} />
                        <Component {...pageProps} />
                    </UserProvider>
                </AbonnementProvider>
            </MantineProvider>
        </HelmetProvider >
    );
}

export default MyApp;