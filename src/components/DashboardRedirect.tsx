// src/components/DashboardRedirect.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: userData, error } = await supabase.auth.getUser();

      if (error || !userData?.user) {
        router.push("/login");
        return;
      }

      const mfaEnabled = userData.user.user_metadata?.mfa_enabled;

      const searchIn = typeof window !== "undefined" ? window.location.search : "";
      const hashIn = typeof window !== "undefined" ? window.location.hash : "";
      const qs = new URLSearchParams(searchIn);

      const hashParams = new URLSearchParams(hashIn.startsWith("#") ? hashIn.substring(1) : hashIn);
      const isSignupFlow = hashParams.get("type") === "signup" || qs.get("type") === "signup";

      if (isSignupFlow && qs.get("onboarding") !== "1") {
        qs.set("onboarding", "1");
      }

      const searchOut = qs.toString() ? `?${qs.toString()}` : "";
      const hashOut = hashIn; // keep the original hash

      if (mfaEnabled) {
        router.push(`/mfa${searchOut}${hashOut}`);
      } else {
        router.push(`/dashboard`);
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return <div>Redirection en cours...</div>;
}
