import AppHeader from "../../components/AppHeader";
import { useUser } from "../../components/context/UserContext";
import LandingPage from "./LandingPage";

export default function Home() {
    const { user } = useUser();
    return <LandingPage onGetStarted={() => { }} />;
}