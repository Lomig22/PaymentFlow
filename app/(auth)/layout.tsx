import { redirect } from "next/navigation";
import Layout from "../../components/layout/Layout";
import { createClient, ensureEmailSettings, fetchAbonnementInfo, syncPendingProfile, verifySubscription } from "../../src/lib/supabase/server";
import { Suspense } from "react";
import { VerifySubscription } from "../../components/layout/VerifySubscription";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }


    await syncPendingProfile();
    await ensureEmailSettings();
    await verifySubscription();
    const { isExpired } = await fetchAbonnementInfo();
    if (isExpired) {
        redirect("/pricing");
    }

    return <main><Suspense fallback={<VerifySubscription />}><Layout>{children}</Layout></Suspense></main>;
}