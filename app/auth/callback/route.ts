// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) return NextResponse.redirect(`${origin}/auth/auth-code-error`);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) =>
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}/auth/auth-code-error`);

    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    const next =
        mfaData?.nextLevel === 'aal2' && mfaData?.currentLevel !== mfaData.nextLevel
            ? '/auth/mfa'
            : '/dashboard';

    return NextResponse.redirect(`${origin}${next}`);
}
