import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./lib/email";
import {
    getEmailSettings,
  } from "./lib/reminderService";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


// Fonction principale
async function processMailNotifications() {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('need_mail_notification', true);

  if (error) {
    console.error('Erreur de récupération des notifications :', error);
    return;
  }

  for (const notification of notifications) {
        const emailSettings = await getEmailSettings(notification.owner_id);
    
    //  faire une requête pour récupérer userProfile 
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", notification.owner_id)
      .single();

    if (profileError) throw profileError;
    if (!userProfile) return false;
  
    if (profileError || !userProfile) {
      console.error('Utilisateur non trouvé pour la notification', notification.id);
      continue;
    }
    const { data: notification_settings, error } = await supabase
    .from("notification_settings")
    .select("email_notifications")
    .eq("user_id", notification.owner_id)
    .maybeSingle();
    if (!notification_settings?.email_notifications){
        console.log("Notification par email désactivée pour: ", notification.owner_id)
        continue
    }
    // Exemple : parse des données du message (selon structure de votre `message` ou `details`)
    const subject = "Payment-flow: "+notification.message;
    const body = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; max-width: 600px;">
      <h2 style="color: #2c3e50;">📬 Nouvelle Notification</h2>
      <p><strong>Type :</strong> ${notification.type}</p>
      <p><strong>Horodatage :</strong> ${new Date(notification.created_at).toLocaleString()}</p>
      <p><strong>Détails :</strong></p>
      <div style="white-space: pre-wrap; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
        ${notification.details}
      </div>
    </div>
  `;
  
    if (!emailSettings){
        console.log("AUCUNE CONFIGURATION DE MAIL POUR : ",notification.owner_id)
        continue
    }
    const emailSent =await  sendEmail(
      emailSettings,
      userProfile.email,
      subject,
      body
    );

    if (emailSent) {
        console.log("Notification  SENT FOR: "+userProfile.email)
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ need_mail_notification: false })
        .eq('id', notification.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la notification', notification.id, updateError);
      } else {
        console.log(`Notification ${notification.id} mise à jour`);
      }
    }
  }
}


processMailNotifications();
