import { headers } from "next/headers";
import AppHeader from "../../components/AppHeader";
import Layout from "../../components/Layout";
import { createClient } from "../../src/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export const metadata = {
  title: 'Payment Flow',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppHeader user={null as any} />
      <main>{children}</main>
    </>
  );
}
