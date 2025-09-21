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

      const search = typeof window !== 'undefined' ? window.location.search : '';
      if (mfaEnabled) {
        navigate(`/mfa${search}`);
      } else {
        navigate(`/dashboard/${encodeURIComponent(userData.user.email || "")}${search}`);
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  return <div>Redirection en cours...</div>;
}
