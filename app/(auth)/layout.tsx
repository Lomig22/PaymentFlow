import { redirect } from "next/navigation";
import Layout from "../../components/Layout";
import { createClient } from "../../src/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return <main><Layout>{children}</Layout></main>;
}