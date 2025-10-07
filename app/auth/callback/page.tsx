'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase/supabase";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleSession = async () => {
            console.log('URL:', window.location.href);
            console.log('PKCE verifier:', localStorage.getItem('sb-pkce-code-verifier'));
            const cookieVerifier = document.cookie
                .split('; ')
                .find(row => row.startsWith('sb-oowgifeydggomowegnnv-auth-token-code-verifier='))
                ?.split('=')[1];
            if (cookieVerifier) {
                localStorage.setItem('sb-oowgifeydggomowegnnv-auth-token-code-verifier', cookieVerifier);
            }
            console.log('LocalStorage PKCE:', localStorage.getItem('sb-oowgifeydggomowegnnv-auth-token-code-verifier'));

            const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
            if (error) {
                setError(`OAuth exchange failed: data: ${data} error: ${error}`);
            }
            else {
                // Check MFA status
                const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
                if (mfaData?.nextLevel === "aal2" && mfaData?.currentLevel !== mfaData.nextLevel) {
                    // MFA required → go to MFA page

                    router.push("/auth/mfa");
                } else {
                    // MFA not required → go to dashboard
                    router.push("/dashboard");
                }
            }

        };

        handleSession();
    }, [router]);

    if (error) return <p>{error}</p>;
    return <p>Connexion en cours...</p>;
}
