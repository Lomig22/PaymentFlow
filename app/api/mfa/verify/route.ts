// app/api/mfa/verify/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
    const body = await req.json();
    const { factorId, challengeId, code } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use service key for server
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
            },
        }
    );

    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
}
