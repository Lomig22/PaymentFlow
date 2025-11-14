import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../src/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value));
                },
            },
        }
    );

    const { error } = await supabase.auth.signOut();

    return NextResponse.json({
        error
    });
}
