// hooks/useAbonnementCheck.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { isBefore } from "date-fns";

export default function useAbonnementCheck() {
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const check = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setIsExpired(true);
        return;
      }

      const { data } = await supabase
        .from("profileStripe")
        .select("subscription_expiry")
        .eq("email", user.email);

      if (data && data.length > 0) {
        const expiry = new Date(data[0].subscription_expiry);
        setIsExpired(isBefore(expiry, new Date()));
        console.log("Subscription expiry date:", expiry);
        
      } else {
        console.log("No subscription data found for user:", user.email);
        
        setIsExpired(true);
      }
      setLoading(false);
    };

    check();
  }, []);

  return { isExpired, loading };
}
