import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../src/lib/supabase/server";



export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json({
        user
    });
}