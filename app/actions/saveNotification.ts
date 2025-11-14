'use server'


import { createClient } from "../../src/lib/supabase/server";
import { Notification } from "../../src/types/database";


export async function saveNotificationServer(notification: Notification) {
    const supabaseAdmin = await createClient();
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert([notification]);

    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
}
