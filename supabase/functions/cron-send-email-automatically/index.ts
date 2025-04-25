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
function convertJHMToMinutes(jhm: {j:number;h:number;m:number}| undefined): number {
  if(!jhm){
    return 60
  }
  const joursEnMinutes = jhm.j * 24 * 60;
  const heuresEnMinutes = jhm.h * 60;
  const minutes = jhm.m;
  
  return joursEnMinutes + heuresEnMinutes + minutes;
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

  const now = new Date();
  const lastReminder = await getLastReminder(receivable.id);  // Récupérer la dernière relance via Supabase
  
  const lastReminderAt = lastReminder ? new Date(lastReminder.reminder_date) : null;

  let delayMinutes = 0;
  console.log("TONGA delayMinutes");

  switch (receivable.status) {
    case 'pending':
      console.log("pending state: ", receivable.client.company_name);
    case 'Relance préventive':
      delayMinutes = receivable.client?.reminder_delay_1 ?? 0;
      break;
    case 'Relance 1':
      delayMinutes = receivable.client?.reminder_delay_2 ?? 0;
      break;
    case 'Relance 2':
      delayMinutes = receivable.client?.reminder_delay_3 ?? 0;
      break;
    case 'Relance 3':
      delayMinutes = receivable.client?.reminder_delay_final ?? 0;
      break;
    default:
      return false;
  }

  console.log("lastReminderAt: ", lastReminderAt);

  // 🟢 S’il n’y a jamais eu de relance => on envoie !
  if (!lastReminderAt) return true;

  const nextReminderTime = lastReminderAt.getTime() + delayMinutes * 60 * 1000;

  return now.getTime() >= nextReminderTime;
}

/* 

  console.log("status: ",receivable.status,"due_date:" ,receivable.due_date);
  
	if (!receivable.status || !receivable.due_date) return false;

	const now = new Date();
  const lastReminder= getLastReminder(receivable.id);
	const lastReminderAt = lastReminder.reminder_date? new Date(receivable.updated_at) : null;

	let delayMinutes = 0;
console.log("TONGA delayMinutes");

	switch (receivable.status) {
		case 'pending':
      console.log("pending state: ",receivable.client.company_name);
      
		case 'Relance préventive':
			delayMinutes = receivable.client?.reminder_delay_1 ?? 0;
			break;
		case 'Relance 1':
			delayMinutes = receivable.client?.reminder_delay_2 ?? 0;
			break;
		case 'Relance 2':
			delayMinutes = receivable.client?.reminder_delay_3 ?? 0;
			break;
		case 'Relance 3':
			delayMinutes = receivable.client?.reminder_delay_final ?? 0;
			break;
		default:
			return false;
	}
  console.log("lastReminderAt: ",lastReminderAt);
  
	// 🟢 S’il n’y a jamais eu de relance => on envoie !
	if (!lastReminderAt) return true;

	const nextReminderTime = lastReminderAt.getTime() + delayMinutes * 60 * 1000;

	return now.getTime() >= nextReminderTime;
} */

export async function sendOneReminder(receivableId: string): Promise<boolean> {
	try {
		const { data: receivable, error: receivableError } = await supabase
			.from('receivables')
			.select('*, client:clients(*)')
			.eq('id', receivableId)
			.single();
console.log("RECEIVABLE");

		if (receivableError) throw receivableError;
		if (!receivable) return false;

	/* 	const { data: { user } } = await supabase.auth.getUser();
		if (!user) return false; */

		const emailSettings = await getEmailSettings(receivable.owner_id);
    console.log("CONFIGURATION MAIIIIIIIIIIIIIIL\n",emailSettings);
    
		if (!emailSettings) return false;

		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

		const { level, template } = determineReminderLevel(
			daysLate,
			receivable.client,
			receivable.status
		);

		if (!level || !template) return false;

		// ⏳ Vérifie si le délai d’attente est respecté
		const lastReminder = await getLastReminder(receivableId);
		const now = new Date();

		let shouldSend = true;

		if (level === 'pre') {
			// Prérelance uniquement si on est AVANT la date d’échéance
			if (now.getTime() >= dueDate.getTime()) return false;

			if (lastReminder && lastReminder.reminder_type === 'pre') {
				const delayMinutes = 1; // 1 minute pour la prérelance
				const nextAllowed = new Date(lastReminder.reminder_date);
				nextAllowed.setMinutes(nextAllowed.getMinutes() + delayMinutes);
				if (now < nextAllowed) return false;
			}
		} else {
			// Pour les autres types, on vérifie le délai personnalisé
			const reminderDelayField = {
				first: receivable.client.reminder_delay_1,
				second: receivable.client.reminder_delay_2,
				third: receivable.client.reminder_delay_3,
				final: receivable.client.reminder_delay_final,
			}[level];

			const delayMinutes = convertJHMToMinutes(reminderDelayField);

			if (lastReminder && lastReminder.reminder_type === level) {
				const nextAllowed = new Date(lastReminder.reminder_date);
				nextAllowed.setMinutes(nextAllowed.getMinutes() + delayMinutes);
				if (now < nextAllowed) return false;
			}
		}

		// 📨 Prépare et envoie le mail
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
			receivable.client.email,
			`Relance facture ${receivable.invoice_number}`,
			emailContent,
			receivable.invoice_pdf_url
		);

		if (emailSent) {
			await supabase.from('reminders').insert({
				receivable_id: receivableId,
				reminder_type: level,
				reminder_date: new Date().toISOString(),
				email_sent: true,
				email_content: emailContent,
			});

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
	

/* 		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return false;
 */
		const emailSettings = await getEmailSettings(receivable.owner_id);
    console.log("CONFIGURATION MAIIIIIIIIIIIIIIL\n",emailSettings);

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
			receivable.client.email,
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

			// Mettre à jour le statut de la créance
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
				console.log("SEND REMINDERS FORM RECEIVABLE"+receivable.client.company_name+" WITH CURRENT STATUS "+receivable.status);
				console.log(receivable.id);
        
				await sendManualReminder(receivable.id);
			}
		
		}
	} catch (err) {
		console.error('Erreur lors de l’envoi automatique des relances :', err);
	}
}


AutomaticallySendReminders();
