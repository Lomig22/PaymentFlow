import "../styles/globals.css";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { HelmetProvider } from "react-helmet-async";
import CalendlyAndChatlingLoader from "../src/components/CalendlyAndChatlingLoader";
import { AbonnementProvider } from "../src/components/context/AbonnementContext";
import AppWithMFA from "../src/App";
import { User } from "@supabase/supabase-js";
import { UserProvider, useUser } from "../components/context/UserContext";
import AppHeader from "../components/AppHeader";
import Layout from "../components/Layout";

interface AppContentProps {
    Component: any;
    pageProps: any;
}

function AppContent({ Component, pageProps }: AppContentProps) {
    const { user } = useUser();

    if (user) {
        return (
            <Layout>
                <Component {...pageProps} />
            </Layout>
        );
    }

    return (
        <>
            <AppHeader user={user} onContactClick={() => { }} />
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
                <AbonnementProvider>
                    <UserProvider>
                        <AppContent Component={Component} pageProps={pageProps} />
                    </UserProvider>
                </AbonnementProvider>
            </MantineProvider>
        </HelmetProvider >
    );
}

export default MyApp;