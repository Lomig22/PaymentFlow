import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../src/lib/supabase/server";



export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Utilisateur non authentifié");

    const userEmail = user.email;

    // 1. Récupérer les IDs des utilisateurs qui ont invité l'utilisateur courant
    const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

    if (invitedByError) throw invitedByError;

    const invitedByIds = invitedByData.map((entry) => entry.invited_by);

    // 2. Inclure l'utilisateur actuel dans les IDs à filtrer
    const allOwnerIds = [user.id, ...invitedByIds];

    // 3. Récupérer les clients pour ces propriétaires
    const { data: clients, error } = await supabase
        .from("clients")
        .select("*, reminderProfile:reminder_profile(*)")
        .in("owner_id", allOwnerIds)
        .order("company_name");

    return NextResponse.json({
        clients,
        error
    });
}