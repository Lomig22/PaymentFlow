import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../src/lib/supabase/server";



export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Utilisateur non authentifié");

    const userEmail = user.email;

    const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

    if (invitedByError) throw invitedByError;

    const invitedByIds = invitedByData.map((entry) => entry.invited_by);
    const allOwnerIds = [user.id, ...invitedByIds];

    const { data: receivables, error } = await supabase
        .from("receivables")
        .select("status, amount, paid_amount, due_date")
        .in("owner_id", allOwnerIds);

    return NextResponse.json({
        receivables,
        error
    });
}