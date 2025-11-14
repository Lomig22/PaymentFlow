import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../src/lib/supabase/server";

export async function POST(req: NextRequest) {

    const supabase = await createClient();

    const { code } = await req.json(); // e.g., token from MFA app/code, type: 'totp' or 'sms'

    const { data: factorsData, error: listError } =
        await supabase.auth.mfa.listFactors();
    if (listError) throw listError;

    const totpFactor = factorsData.totp.find(
        (f) => f.status === "verified"
    );
    if (!totpFactor)
        throw new Error("Aucun facteur TOTP non vérifié trouvé.");

    if (!totpFactor) throw new Error("Aucun facteur TOTP trouvé.");

    const factorId = totpFactor.id;
    const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;

    const challengeId = challengeData.id;

    console.log("✅ TOTP factor ID:", factorId);
    console.log("✅ Challenge ID:", challengeId);
    console.log("🔢 Code saisi:", code);

    // Fallback timeout de 7s si Supabase ne répond pas
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
    });

    // Optionally check the new assurance level
    const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const { currentLevel, nextLevel } = assuranceData ?? {};

    return NextResponse.json({
        verifyData,
        verifyError
    });
}
