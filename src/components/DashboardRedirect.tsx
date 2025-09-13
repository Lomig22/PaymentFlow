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

      if (mfaEnabled) {
        navigate("/mfa");
      } else {
        navigate(`/dashboard/${encodeURIComponent(userData.user.email || "")}`);
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  return <div>Redirection en cours...</div>;
}
