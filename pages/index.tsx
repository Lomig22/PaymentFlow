import { GetServerSideProps } from "next";
import { useUser } from "../components/context/UserContext";
import LandingPage from "./landing/LandingPage";
import AppHeader from "../components/AppHeader";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { checkAuth } from "../src/lib/supabase";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await checkAuth();


    if (session?.user) {
        return {
            redirect: { destination: "/dashboard", permanent: false },
        };
    }

    // Not logged in → render landing page server-side
    return { props: {} };
};

export default function Home() {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (!isLoading && user) {
            // Redirect logged-in user to dashboard
            router.replace("/dashboard");
        }
    }, [user, isLoading, router]);
    return <LandingPage onGetStarted={() => { }} />;
}