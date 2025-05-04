import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { determineReminderLevel, formatTemplate, getEmailSettings } from './lib/reminderService';
import { sendEmail } from './lib/email';
import { Client } from './types/database';
import { log } from 'console';
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
function convertJHMToMinutes(jhm: { j?: number; h?: number; m: number } | undefined): number {
  if (!jhm) {
    return 0; // retourne 0 si l'objet est undefined ou invalide
  }
  
  // Si les valeurs de jours et heures sont absentes, elles seront considérées comme 0
  const joursEnMinutes = (jhm.j ?? 0) * 24 * 60; // Utilisation de '??' pour fournir une valeur par défaut si 'j' est undefined
  const heuresEnMinutes = (jhm.h ?? 0) * 60;  // Idem pour 'h'
  const minutes = jhm.m;  // m est toujours fourni

  const totalInMinutes = joursEnMinutes + heuresEnMinutes + minutes;
  console.log("Total de minutes:", totalInMinutes);
  
  return totalInMinutes;
}


async function getLastReminder(receivableId: string) {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('receivable_id', receivableId)
    .order('reminder_date', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

async function shouldSendReminder(receivable: any): Promise<boolean> {
	console.log("status: ", receivable.status, "due_date:", receivable.due_date);
  
	if (!receivable.status || !receivable.due_date) return false;
  
	if (!receivable.automatic_reminder) {
	  console.log("RAPPEL AUTOMATIQUE DESACTIVÉ POUR LA CRÉANCE: ", receivable.id);
	  return false;
	}
  
	const now = new Date();
	const lastReminder = await getLastReminder(receivable.id);
	const lastReminderAt = lastReminder ? new Date(lastReminder.reminder_date) : null;
  
	let delayMinutes = 0;
	console.log("RECEIVABLE STATUS: ", receivable.status);
  
	switch (receivable.status) {
		case 'pending': {
			const delayPre = receivable.client?.pre_reminder_delay || { j: 1, h: 0, m: 0 };
			console.log("Pré-reminder delay: ", delayPre);
			delayMinutes = convertJHMToMinutes(delayPre);
		  
			const dueDate = new Date(receivable.due_date);
			const reminderTime = new Date(dueDate.getTime() - delayMinutes * 60 * 1000);
		  
			console.log("Pré-reminder doit être envoyé à partir de : ", reminderTime);
		  
			// On n'envoie que si la date actuelle est >= à "due_date - délai"
			return now >= reminderTime && now < dueDate;
		  }		  
  
	  case 'Relance préventive': {
		const delay1 = receivable.client?.reminder_delay_1;
		console.log("Reminder Delay 1: ", delay1);
		delayMinutes = convertJHMToMinutes(delay1) ?? 0;
		break;
	  }
  
	  case 'Relance 1': {
		const delay2 = receivable.client?.reminder_delay_2;
		console.log("Reminder Delay 2: ", delay2);
		delayMinutes = convertJHMToMinutes(delay2) ?? 0;
		break;
	  }
  
	  case 'Relance 2': {
		const delay3 = receivable.client?.reminder_delay_3;
		console.log("Reminder Delay 3: ", delay3);
		delayMinutes = convertJHMToMinutes(delay3) ?? 0;
		break;
	  }
  
	  case 'Relance 3': {
		const delayFinal = receivable.client?.reminder_delay_final;
		console.log("Reminder Final Delay: ", delayFinal);
		delayMinutes = convertJHMToMinutes(delayFinal) ?? 0;
		break;
	  }
  
	  default:
		return false;
	}
  
	console.log("lastReminderAt: ", lastReminderAt);
	console.log("delay minutes: ", delayMinutes);
  
	if (!lastReminderAt) return true;
  
	const nextReminderTime = lastReminderAt.getTime() + delayMinutes * 60 * 1000;
	return now.getTime() >= nextReminderTime;
  }
  
export async function sendManualReminder(
	receivableId: string
): Promise<boolean> {
	try {
		const { data: receivable, error: receivableError } = await supabase
			.from('receivables')
			.select('*, client:clients(*)')
			.eq('id', receivableId)
			.single();

		if (receivableError) throw receivableError;
		if (!receivable) return false;
		
		const emailSettings = await getEmailSettings(receivable.owner_id);
  //  console.log("CONFIGURATION MAIIIIIIIIIIIIIIL\n",emailSettings);

		if (!emailSettings) return false;

		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const daysLate = Math.floor(
			(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		const { level, template } = determineReminderLevel(
			daysLate,
			receivable.client,
			receivable.status
		);
		if (!level || !template) return false;

		const emailContent = formatTemplate(template, {
			company: receivable.client.company_name,
			amount: receivable.amount,
			invoice_number: receivable.invoice_number,
			due_date: receivable.due_date,
			days_late: daysLate || 0,
			days_left: Math.max(0, -1 * daysLate),
		});

		const emailSent = await sendEmail(
			emailSettings,
			receivable.email||receivable.client.email,
			`Relance facture ${receivable.invoice_number}`,
			emailContent,
			receivable.invoice_pdf_url
		);

		if (emailSent) {
			// Enregistrer la relance
			await supabase.from('reminders').insert({
				receivable_id: receivableId,
				reminder_type: level,
				reminder_date: new Date().toISOString(),
				email_sent: true,
				email_content: emailContent,
			});

			// Mettre à jour le status de la créance
			await supabase
				.from('receivables')
				.update({
					status:
						level === 'first'
							? 'Relance 1'
							: level === 'second'
							? 'Relance 2'
							: level === 'third'
							? 'Relance 3'
							: level === 'final'
							? 'Relance finale'
							: level === 'pre'
							? 'Relance préventive'
							: 'Relance',
					updated_at: new Date().toISOString(),
				})
				.eq('id', receivableId);

			return true;
		}

		return false;
	} catch (error) {
		console.error("Erreur lors de l'envoi de la relance:", error);
		return false;
	}
}
async function AutomaticallySendReminders(): Promise<void> {
	try {
		const { data: receivables, error } = await supabase
			.from('receivables')
			.select('*, client:clients(*)')
			.in('status', ['pending', 'Relance 1', 'Relance 2', 'Relance 3', 'Relance finale', 'Relance préventive']) // ou selon tes statuts
			

		if (error) throw error;
		if (!receivables || receivables.length === 0) return;
		for (const receivable of receivables) {
	//	console.log("Receivable: ",receivable);
    
      if (await shouldSendReminder(receivable)) {
				console.log("sHOULD SEND REMINDERS TO "+receivable.client.company_name+" WITH CURRENT STATUS "+receivable.status);
				console.log(receivable.id);
        
				await sendManualReminder(receivable.id);
			}
		
		}
	} catch (err) {
		console.error('Erreur lors de l’envoi automatique des relances :', err);
	}
}


AutomaticallySendReminders();
