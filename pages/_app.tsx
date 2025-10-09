import "../styles/globals.css";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { HelmetProvider } from "react-helmet-async";
import CalendlyAndChatlingLoader from "../components/CalendlyAndChatlingLoader";
import { UserProvider, useUser } from "../components/context/UserContext";
import AppHeader from "../components/AppHeader";

interface AppContentProps {
    Component: any;
    pageProps: any;
}

function AppContent({ Component, pageProps }: AppContentProps) {
    const { user } = useUser();

    if (user) {
        return (
            <Component {...pageProps} />
        );
    }

    return (
        <>
            <AppHeader user={user} />
            <Component {...pageProps} />
        </>
    );
}

function MyApp({ Component, pageProps }: AppProps) {
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
                <UserProvider>
                    <AppContent Component={Component} pageProps={pageProps} />
                </UserProvider>
            </MantineProvider>
        </HelmetProvider >
    );
}

export default MyApp;