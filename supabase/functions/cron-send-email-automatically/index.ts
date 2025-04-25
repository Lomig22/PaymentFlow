import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { determineReminderLevel, formatTemplate, getEmailSettings } from './lib/reminderService';
import { sendEmail } from './lib/email';
import { Client } from './types/database';
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

function hasDelayPassed(since: Date, delay: Delay): boolean {
  const delayMs =
    (delay.j || 0) * 24 * 60 * 60 * 1000 +
    (delay.h || 0) * 60 * 60 * 1000 +
    (delay.m || 0) * 60 * 1000;

  const now = new Date();
  const value=new Date(since.getTime() + delayMs).getTime()
  console.log("NOW: ",now," VALUE: ",value);
  
  return now.getTime() >=value ;
}

async function AutomaticallySendReminders(): Promise<void> {
  try {
    const { data: receivables, error } = await supabase
      .from('receivables')
      .select('*, client:clients(*), reminders(*)')
//      .eq('status', 'En attente');

    if (error) throw error;

    if (!receivables || receivables.length === 0) {
      console.log('Aucune créance à traiter');
      return;
    }

    for (const receivable of receivables as Receivable[]) {
      //  console.log("receivable:",receivable);
        
      const { due_date, client, id, status } = receivable;

      if (!client || !client.email) continue;

      const today = new Date();
      const dueDate = new Date(due_date);
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
console.log("STATUS: ",status);

      const reminderInfo = determineReminderLevel(daysLate, client, status);

      if (!reminderInfo.level || !reminderInfo.template) continue;

      const emailSettings = await getEmailSettings(client.id);
      if (!emailSettings) continue;

      const emailContent = formatTemplate(reminderInfo.template, {
        company: client.company_name,
        amount: receivable.amount,
        invoice_number: receivable.invoice_number,
        due_date: receivable.due_date,
        days_late: daysLate || 0,
        days_left: Math.max(0, -1 * daysLate),
      });

      const emailSent = await sendEmail(
        emailSettings,
        client.email,
        `Relance facture ${receivable.invoice_number}`,
        emailContent,
        receivable.invoice_pdf_url
      );

      if (emailSent) {
        console.log(`✅ Email envoyé pour la créance ${receivable.invoice_number} (${reminderInfo.level})`);

        await supabase.from('reminders').insert({
          receivable_id: id,
          reminder_type: reminderInfo.level,
          reminder_date: new Date().toISOString(),
          email_sent: true,
          email_content: emailContent,
        });

        const newStatus =
          reminderInfo.level === 'first'
            ? 'Relance 1'
            : reminderInfo.level === 'second'
            ? 'Relance 2'
            : reminderInfo.level === 'third'
            ? 'Relance 3'
            : reminderInfo.level === 'final'
            ? 'Relance finale'
            : 'Relance préventive';

        await supabase
          .from('receivables')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);
      }
    }
  } catch (err) {
    console.error('❌ Erreur dans l’envoi automatique des relances :', err);
  }
}

AutomaticallySendReminders();
