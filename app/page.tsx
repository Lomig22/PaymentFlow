import LandingPage from "./(public)/landing/page";
import { redirect } from "next/navigation";
import { createClient } from "../src/lib/supabase/server";

export default async function HomePage() {
    // Create Supabase client bound to current request cookies
    const supabase = await createClient();

    // Get session from Supabase server-side
    const { data, error } = await supabase.auth.getUser();

    console.log("USER DATA / page: ", data);

    // If user is logged in → redirect to dashboard
    if (!error && data?.user) {
        redirect("/dashboard");
    }
    else {
        redirect("/landing");
    }
}