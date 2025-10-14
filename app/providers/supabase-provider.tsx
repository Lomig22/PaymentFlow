"use client";

import { useEffect, createContext, useContext, useState } from "react";
import { supabase } from "../../src/lib/supabase/supabase";

const SupabaseContext = createContext(supabase);

export const useSupabase = () => useContext(SupabaseContext);

export default function SupabaseProvider({ children, initialSession }) {
    const [client] = useState(supabase);

    useEffect(() => {
        let mounted = true;

        const hydrate = async () => {
            const { data: { session } } = await client.auth.getSession();

            if (!session && initialSession && mounted) {
                // Force hydration
                await client.auth.setSession(initialSession);
            }
        };

        hydrate();
        // Optionally keep client updated with session changes
        const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                return;
            }
            client.auth.setSession(session);
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        }
    }, [client, initialSession]);

    return (
        <SupabaseContext.Provider value={client}>
            {children}
        </SupabaseContext.Provider>
    );
}
