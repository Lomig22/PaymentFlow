import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useUser } from "../components/context/UserContext";
import { useEffect } from "react";
import LandingPage from "./landing/LandingPage";
import AppHeader from "../src/components/AppHeader";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const token = context.req.cookies.token;
    const userIsLoggedIn = Boolean(token);

    if (userIsLoggedIn) {
        return {
            redirect: { destination: "/dashboard", permanent: false },
        };
    }

    // Not logged in → render landing page server-side
    return { props: {} };
};

export default function Home() {
    // const router = useRouter();
    const { user, isLoading } = useUser();

    // useEffect(() => {
    //     if (!isLoading && user) {
    //         // Redirect logged-in user to dashboard
    //         router.replace("/dashboard");
    //     }
    // }, [user, isLoading, router]);
    return <LandingPage onGetStarted={() => { }} />;
}