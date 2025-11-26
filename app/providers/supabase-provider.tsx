'use client';

import { useEffect, createContext, useContext, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Session } from '@supabase/supabase-js';

type SupabaseContextType = ReturnType<typeof createBrowserClient<any, "public">>;

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export const useSupabase = () => {
    const ctx = useContext(SupabaseContext);
    if (!ctx) throw new Error('useSupabase must be used within SupabaseProvider');
    return ctx;
};

type Props = {
    children: React.ReactNode;
    initialSession: Session | null;
};

export default function SupabaseProvider({ children, initialSession }: Props) {
    const [client] = useState(() =>
        createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    );

    useEffect(() => {
        let mounted = true;

        const syncSession = async () => {
            const { data: { session } } = await client.auth.getSession();

            // If client has no session but the server sent one → set it
            if (!session && initialSession && mounted) {
                await client.auth.setSession({
                    access_token: initialSession.access_token,
                    refresh_token: initialSession.refresh_token!,
                });
            }

            // If both exist but differ (e.g., refreshed token), prefer server
            if (
                session?.access_token &&
                initialSession?.access_token &&
                session.access_token !== initialSession.access_token
            ) {
                await client.auth.setSession({
                    access_token: initialSession.access_token,
                    refresh_token: initialSession.refresh_token!,
                });
            }
        };

        syncSession();

        // Optional: listen for session updates and persist them
        const { data: subscription } = client.auth.onAuthStateChange((event, session) => {
            if (!session) return;
            // You could sync to localStorage or trigger an API route update here
            // console.log('Session changed:', event, session);
        });

        return () => {
            mounted = false;
            subscription.subscription.unsubscribe();
        };
    }, [client, initialSession]);

    return (
        <SupabaseContext.Provider value={client}>
            {children}
        </SupabaseContext.Provider>
    );
}
