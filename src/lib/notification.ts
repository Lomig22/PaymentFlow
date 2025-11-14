import { supabase } from "./supabase/supabase";
import { Notification } from "../types/database";

export async function saveNotification(notification: Notification) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification]);
  console.log("notifications: ", notification);

  if (error) {
    console.error('Erreur lors de la sauvegarde de la notification :', error);
    throw error;
  }

  return data;
}

// Journalise une erreur système côté base (déclenchement d'une notification via trigger)
export async function logSystemError(params: { code?: string | null; message: string; details?: Record<string, any> }) {
  const { code = null, message, details = {} } = params;
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) {
    console.warn("logSystemError: utilisateur non authentifié");
    return null;
  }
  const { data, error } = await supabase
    .from('system_errors')
    .insert({ owner_id: uid, code, message, details })
    .select()
    .maybeSingle();
  if (error) {
    console.error('Erreur lors du log système :', error);
    throw error;
  }
  return data;
}
