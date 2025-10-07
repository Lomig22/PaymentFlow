import { NextResponse } from "next/server";
import { createClient } from "../../../../src/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();


    // Generate Google OAuth URL with PKCE + redirectTo
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        },
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ✅ Store the code_verifier in a secure, HTTP-only cookie
    const response = NextResponse.json({ url: data.url });


    return response;
}
