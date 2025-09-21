// src/components/DashboardRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: userData, error } = await supabase.auth.getUser();

      if (error || !userData?.user) {
        navigate("/login");
        return;
      }

      const mfaEnabled = userData.user.user_metadata?.mfa_enabled;

      const searchIn = typeof window !== 'undefined' ? window.location.search : '';
      const hashIn = typeof window !== 'undefined' ? window.location.hash : '';
      const qs = new URLSearchParams(searchIn);
      // Si le hash indique un flow de signup Supabase, on force le flag d'onboarding
      const hashParams = new URLSearchParams(hashIn.startsWith('#') ? hashIn.substring(1) : hashIn);
      const isSignupFlow = hashParams.get('type') === 'signup' || qs.get('type') === 'signup';
      if (isSignupFlow && qs.get('onboarding') !== '1') {
        qs.set('onboarding', '1');
      }
      const searchOut = qs.toString() ? `?${qs.toString()}` : '';

      if (mfaEnabled) {
        navigate({ pathname: "/mfa", search: searchOut, hash: hashIn });
      } else {
        navigate({ pathname: `/dashboard/${encodeURIComponent(userData.user.email || "")}`, search: searchOut, hash: hashIn });
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  return <div>Redirection en cours...</div>;
}
