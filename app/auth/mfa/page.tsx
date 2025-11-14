import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import VerifyMFAForm from "./verify-form";

export default async function MFAPage() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
        console.log("No session found in MFA page", error);
        redirect("/login");
    }

    // You could also check if user already has AAL2, skip MFA
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaData?.nextLevel === "aal2" && mfaData?.currentLevel === "aal2") {
        redirect("/dashboard");
    }



    const { data: factorsData, error: listError } =
        await supabase.auth.mfa.listFactors();
    if (listError) throw listError;

    const totpFactor = factorsData.totp.find(
        (f) => f.status === "verified"
    );
    if (!totpFactor)
        throw new Error("Aucun facteur TOTP non vérifié trouvé.");

    if (!totpFactor) throw new Error("Aucun facteur TOTP trouvé.");

    const factorId = totpFactor.id;
    const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;

    const challengeId = challengeData.id;

    return <VerifyMFAForm factorId={factorId} challengeId={challengeId} />;
}