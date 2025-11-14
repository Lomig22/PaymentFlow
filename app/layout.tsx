import { cookies } from "next/headers";
import "../styles/globals.css";
import { createServerClient } from "@supabase/ssr";
import SupabaseProvider from "./providers/supabase-provider";

export const metadata = {
  title: 'Payment Flow',
}

export default async function RootLayout({

  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => { },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="fr">
      <body>
        <SupabaseProvider initialSession={session}>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
