import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  determineReminderLevel,
  formatTemplate,
  getEmailSettings,
} from "./lib/reminderService";
import { sendEmail } from "./lib/email";
import { Client } from "./types/database";
import { log, profile } from "console";
// Typages explicites
type Delay = {
  j?: number; // jours
  h?: number; // heures
  m?: number; // minutes
};

type Receivable = {
  id: string;
  client: Client;
  due_date: string;
  amount: number;
  invoice_number: string;
  invoice_pdf_url: string;
  status: string;
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
function convertJHMToMinutes(
  jhm: { j?: number; h?: number; m: number } | undefined
): number {
  if (!jhm) {
    return 0; // retourne 0 si l'objet est undefined ou invalide
  }

  // Si les valeurs de jours et heures sont absentes, elles seront considérées comme 0
  const joursEnMinutes = (jhm.j ?? 0) * 24 * 60; // Utilisation de '??' pour fournir une valeur par défaut si 'j' est undefined
  const heuresEnMinutes = (jhm.h ?? 0) * 60; // Idem pour 'h'
  const minutes = jhm.m; // m est toujours fourni

  const totalInMinutes = joursEnMinutes + heuresEnMinutes + minutes;

  return totalInMinutes;
}

async function getLastReminder(receivableId: string) {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("receivable_id", receivableId)
    .order("reminder_date", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

async function shouldSendReminder(receivable: any): Promise<boolean> {
  if (!receivable.status || !receivable.due_date) return false;

  if (!receivable.automatic_reminder) {
    console.log(
      "RAPPEL AUTOMATIQUE DESACTIVÉ POUR LA CRÉANCE: ",
      receivable.id
    );
    return false;
  }
  const isLastStatus=(status:string)=>{
    const lastStatus=receivable.client?.reminder_enable_final?
    'Relance finale':receivable.client?.reminder_enable_3?
    'Relance 3':  receivable.client?.reminder_enable_2?
    'Relance 2': receivable.client?.reminder_enable_1?
    'Relance 1':'Relance préventive'
    return  status===lastStatus
  }
  const now = new Date();
  const lastReminder = await getLastReminder(receivable.id);
  const lastReminderAt = lastReminder
    ? new Date(lastReminder.reminder_date)
    : null;

  let delayMinutes = 0;
  let nextReminderTime = now.getTime();
  let lastStatus='';
  switch (receivable.status) {
    case "pending": {
      if (receivable.client?.pre_reminder_enable===false) {
        // Mettre à jour le statut de la créance
        await supabase
          .from("receivables")
          .update({
            status: "Relance préventive",
            updated_at: new Date().toISOString(),
          })
          .eq("id", receivable.id);

        return false
      }
      console.log("prérelance activé")
      const dueDate = new Date(receivable.due_date);
      const reminderTime = new Date(
        receivable.client?.pre_reminder_date
      ).getTime();

      // On n'envoie que si la date actuelle est >= à "due_date - délai"
      return now.getTime() >= reminderTime;
    }

    case "Relance préventive": {
      if (isLastStatus("Relance préventive")){
        return false
      }
      if (receivable.client?.reminder_enable_1===false) {
        await supabase
          .from("receivables")
          .update({
            status: "Relance 1",
            updated_at: new Date().toISOString(),
          })
          .eq("id", receivable.id);
          return false
      }
      console.log("relance1 activée")
      const delay1 = receivable.client?.reminder_delay_1;
      nextReminderTime = new Date(receivable.client?.reminder_date_1).getTime();
      break;
    }

    case "Relance 1": {
      if (isLastStatus("Relance 1")){
        return false
      }
      if (receivable.client?.reminder_enable_2===false) {
        await supabase
          .from("receivables")
          .update({
            status: "Relance 2",
            updated_at: new Date().toISOString(),
          })
          .eq("id", receivable.id);
          return false
      }
      console.log("relance 2 activée")
      const delay2 = receivable.client?.reminder_delay_2;
      nextReminderTime = new Date(receivable.client?.reminder_date_2).getTime();
      break;
    }

    case "Relance 2": {
      if (isLastStatus("Relance 2")){
        return false
      }
      if (receivable.client?.reminder_enable_3===false) {
        await supabase
          .from("receivables")
          .update({
            status: "Relance 3",
            updated_at: new Date().toISOString(),
          })
          .eq("id", receivable.id);
          return false
      }
      console.log("relance 3 activée")

      const delay3 = receivable.client?.reminder_delay_3;
      nextReminderTime = new Date(receivable.client?.reminder_date_3).getTime();
      break;
    }
    //Jet rel3
    case "Relance 3": {
      if (isLastStatus("Relance 3")){
        return false
      }
      if (receivable.client?.reminder_enable_final===false) {
        await supabase
          .from("receivables")
          .update({
            status: "Relance finale",
            updated_at: new Date().toISOString(),
          })
          .eq("id", receivable.id);
          console.log("relance finale désactivée: ",receivable.client?.reminder_enable_final)
          return false
        }
      console.log("relance finale activée")

      const delayFinal = receivable.client?.reminder_delay_final;
      nextReminderTime = new Date(
        receivable.client?.reminder_date_final
      ).getTime();
      break;
    }

    default:
      return false;
  }

  if (!lastReminderAt) return true;

  return now.getTime() >= nextReminderTime;
}

export async function sendManualReminder(
  receivableId: string,
  userId: string // ID de l'utilisateur connecté
): Promise<boolean> {
  try {
    // Récupérer la créance et le client associés
    const { data: receivable, error: receivableError } = await supabase
      .from("receivables")
      .select("*, client:clients(*)")
      .eq("id", receivableId)
      .single();
    console.log("ID de la créance pour la relance :", receivableId);

    if (receivableError) throw receivableError;
    if (!receivable) return false;
    console.log(receivable.owner_id);
    // Récupérer les paramètres de l'email de l'utilisateur connecté
    const emailSettings = await getEmailSettings(receivable.owner_id);
    if (!emailSettings) {
      console.log("AUCUN  PARAMETRE d'email");
      return false;
    }

    // Récupérer les informations de l'utilisateur connecté
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email_counter,email")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;
    if (!userProfile) return false;

    // Récupérer le type de souscription de l'utilisateur
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .single();

    if (subscriptionError) throw subscriptionError;
    if (!subscription) return false;

    // Vérifier la limite d'envois pour un utilisateur avec le plan "free"
    const isFreePlan = subscription.plan === "free";
    const maxEmails = isFreePlan ? 20 : Infinity; // 20 pour le plan gratuit

    if (userProfile.email_counter >= maxEmails) {
      throw new Error(
        "Le nombre maximal d'e-mails pour votre essai gratuit a été atteint."
      );
    }

    // Calculer les jours de retard
    const dueDate = new Date(receivable.due_date);
    const today = new Date();
    const daysLate = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Déterminer le niveau de relance
    const { level, template } = determineReminderLevel(
      daysLate,
      receivable.client,
      receivable.status
    );
    if (!level || !template) return false;

    // Formater le contenu de l'e-mail
    const emailContent = formatTemplate(template, {
      company: receivable.client.company_name,
      amount: receivable.amount,
      invoice_number: receivable.invoice_number,
      due_date: receivable.due_date,
      days_late: daysLate || 0,
      days_left: Math.max(0, -1 * daysLate),
    });

    // Envoyer l'e-mail
    const emailSent = await sendEmail(
      emailSettings,
      receivable.email || receivable.client.email,
      `Relance facture ${receivable.invoice_number}`,
      emailContent,
      receivable.invoice_pdf_url
    );

    if (emailSent) {
      // Enregistrer la relance
      const { data: notification_settings, error } = await supabase
      .from("notification_settings")
      .select("reminder_notifications")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    const reminder_notifications=notification_settings?.reminder_notifications
    console.log(reminder_notifications)
    if (reminder_notifications === true) {
      const currentStatus=(receivable.status==="pending")?"Relance préventive":
      (receivable.status==="Relance préventive")?"Relance 1":
      (receivable.status==="Relance 1")?"Relance 2":
      (receivable.status==="Relance 2")?"Relance 3":
      "Relance Finale"
      const emailSent = sendEmail(
        emailSettings,
        userProfile.email,
        "Relance automatique effectuée",
        "La  "+receivable.status +" de la créance de "+
          receivable.client.company_name +
          ", portant le numéro de facture " +
          receivable.invoice_number +
          ", a été envoyée"
      );}
      await supabase.from("reminders").insert({
        receivable_id: receivableId,
        reminder_type: level,
        reminder_date: new Date().toISOString(),
        email_sent: true,
        email_content: emailContent,
      });
    
      // Mettre à jour le statut de la créance
      await supabase
        .from("receivables")
        .update({
          status:
            level === "first"
              ? "Relance 1"
              : level === "second"
              ? "Relance 2"
              : level === "third"
              ? "Relance 3"
              : level === "final"
              ? "Relance finale"
              : level === "pre"
              ? "Relance préventive"
              : "Relance",
          updated_at: new Date().toISOString(),
        })
        .eq("id", receivableId);
      //Jet
      if (level === "final") {
        // Mettre à jour le statut de la créance
        await supabase
          .from("receivables")
          .update({
            automatic_reminder: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", receivableId);
      }
      // Incrémenter le compteur d'e-mails envoyés
      await supabase
        .from("profiles")
        .update({
          email_counter: userProfile.email_counter + 1,
        })
        .eq("id", userId);

      return true;
    }

    return false;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la relance:", error);
    // Si l'erreur est liée à la limite d'e-mails, on retourne un message spécifique
    if (
      error.message ===
      "Le nombre maximal d'e-mails pour votre essai gratuit a été atteint."
    ) {
      throw new Error(error.message);
    }
    return false;
  }
}

async function AutomaticallySendReminders(): Promise<void> {
  try {
    const { data: receivables, error } = await supabase
      .from("receivables")
      .select("*, client:clients(*)")
      .in("status", [
        "pending",
        "Relance 1",
        "Relance 2",
        "Relance 3",
        "Relance finale",
        "Relance préventive",
      ]); // ou selon tes statuts
      
    if (error) throw error;
    if (!receivables || receivables.length === 0) return;
    for (const receivable of receivables) {
      //	console.log("Receivable: ",receivable);

      if (await shouldSendReminder(receivable)) {
        console.log(
          "sHOULD SEND REMINDERS TO " +
            receivable.client.company_name +
            " WITH CURRENT STATUS " +
            receivable.status
        );
        console.log(receivable.id);

        await sendManualReminder(receivable.id, receivable.owner_id);
      }
    }
  } catch (err) {
    console.error("Erreur lors de l’envoi automatique des relances :", err);
  }
}

AutomaticallySendReminders();
