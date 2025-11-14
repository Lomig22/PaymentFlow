// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../src/lib/supabase/server";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data.user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 400 });

    // Vérifier l’abonnement (crée un abonnement 'free' si absent)
    const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", data.user.id)
        .limit(1);

    if (!subError && !subscriptions?.length) {
        const { error: insErr } = await supabase.from("subscriptions").insert({
            user_id: data.user.id,
            created_at: new Date().toISOString(),
            status: "active",
            plan: "free",
        });
        if (insErr) {
            console.warn("Impossible de créer l'abonnement par défaut:", insErr);
        }
    }

    if (!data.user.email) {
        throw new Error("Email utilisateur introuvable. Veuillez réessayer.");
    }

    // 2️⃣ Check MFA
    const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaError) return NextResponse.json({ error: mfaError.message }, { status: 400 });

    const { currentLevel, nextLevel } = mfaData ?? {};
    const requiresMFA = nextLevel === "aal2" && currentLevel !== nextLevel;

    return NextResponse.json({
        user: data.user,
        session: data.session,
        requiresMFA,
    });

}
