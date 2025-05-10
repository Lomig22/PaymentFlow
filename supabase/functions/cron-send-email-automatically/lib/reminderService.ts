import { supabase } from './supabase';
import { Receivable, Client } from '../types/database';
import { sendEmail } from './email';

interface EmailSettings {
	provider_type: string;
	smtp_username: string;
	smtp_password: string;
	smtp_server: string;
	smtp_port: number;
	smtp_encryption: string;
	email_signature?: string;
}

  
  function convertJHMToMinutes(jhm: {j:number;h:number;m:number}| undefined): number {
	if(!jhm){
		return 60
	}
	const joursEnMinutes = jhm.j * 24 * 60;
	const heuresEnMinutes = jhm.h * 60;
	const minutes = jhm.m;
  
	return joursEnMinutes + heuresEnMinutes + minutes;
  }
// Fonction pour récupérer les paramètres email de l'utilisateur
export async function getEmailSettings(userId: string): Promise<EmailSettings | null> {
	try {
		const { data, error } = await supabase
			.from('email_settings')
			.select('*')
			.eq('user_id', userId)
			.maybeSingle();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}
		return data;
	} catch (error) {
		console.error(
			'Erreur lors de la récupération des paramètres email:',
			error
		);
		return null;
	}
}

// Fonction pour formater le template avec les variables
export function formatTemplate(
	template: string,
	variables: {
		company: string;
		amount: number;
		invoice_number: string;
		due_date: string;
		days_late: number;
		days_left?: number;
	}
): string {
	return template
		.replace(/{company}/g, variables.company)
		.replace(
			/{amount}/g,
			new Intl.NumberFormat('fr-FR', {
				style: 'currency',
				currency: 'EUR',
			}).format(variables.amount)
		)
		.replace(/{invoice_number}/g, variables.invoice_number)
		.replace(
			/{due_date}/g,
			new Date(variables.due_date).toLocaleDateString('fr-FR')
		)
		.replace(/{days_late}/g, variables.days_late.toString())
		.replace(/{days_left}/g, variables.days_left?.toString() || '0');
}

// Fonction pour déterminer le niveau de relance approprié
export function determineReminderLevel(
	daysLate: number,
	client: Client,
	status: string
): {
	level: 'pre' | 'first' | 'second' | 'third' | 'final' | null;
	template: string | null;
} {
	// Si aucun client n'est fourni, on retourne null
	if (!client) return { level: null, template: null };

	// Gestion des cas où une relance a déjà atteint le niveau final
	if (status === 'Relance finale') return { level: null, template: null };

	// Si une relance a déjà été faite avec un certain niveau,
	// on renvoie directement le niveau suivant avec le template correspondant
	if (status === 'Relance 3' && client.reminder_template_final)
		return { level: 'final', template: client.reminder_template_final };
	if (status === 'Relance 2' && client.reminder_template_3)
		return { level: 'third', template: client.reminder_template_3 };
	if (status === 'Relance 1' && client.reminder_template_2)
		return { level: 'second', template: client.reminder_template_2 };
	if (status === 'Relance préventive' && client.reminder_template_1 )
		return { level: 'first', template: client.reminder_template_1 };
	if (status ==='pending' && client.pre_reminder_template && daysLate<=0){
		alert("pending")
		return { level: 'pre', template: client.pre_reminder_template }; 
	}
	// Si aucun statut de relance encore, on peut proposer un pré-reminder
 	if (status==="pending" && client.reminder_template_1 && daysLate>0){
		return { level: 'first', template: client.reminder_template_1 };
	} 
		

	// Conversion des jours de retard en minutes (1 jour = 24h * 60min)
	let daysLateMinutes:number = daysLate * 24 * 60;

	// Vérification selon le nombre de minutes de retard et les templates disponibles
	// On commence par les relances les plus sévères (final → first)

	if (
		daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_final)) &&
		client.reminder_template_final
	) {
		return { level: 'final', template: client.reminder_template_final };
	}

	if (
		daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_3) ) &&
		client.reminder_template_3
	) {
		return { level: 'third', template: client.reminder_template_3 };
	}

	if (
		daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_2) ) &&
		client.reminder_template_2
	) {
		return { level: 'second', template: client.reminder_template_2 };
	}

	if (
		daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_1) || 15) &&
		client.reminder_template_1
	) {
		return { level: 'first', template: client.reminder_template_1 };
	}

	// Si aucun des cas ci-dessus ne s'applique, on retourne une relance préventive si disponible
	return { level: 'pre', template: client.pre_reminder_template || null };
}




// Fonction principale pour vérifier et envoyer les relances automatiques
// Fonction qui vérifie les factures en attente de paiement pour un utilisateur donné,
// puis envoie des emails de relance si nécessaire.


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

export async function sendOneReminder(receivableId: string): Promise<boolean> {
	try {
		const { data: receivable, error: receivableError } = await supabase
			.from('receivables')
			.select('*, client:clients(*)')
			.eq('id', receivableId)
			.single();

		if (receivableError) throw receivableError;
		if (!receivable) return false;

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return false;

		const emailSettings = await getEmailSettings(user.id);
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




function shouldSendReminder(receivable: any): boolean {
	if (!receivable.status || !receivable.due_date) return false;

	const now = new Date();
	const lastReminderAt = receivable.updated_at ? new Date(receivable.updated_at) : null;

	let delayMinutes = 0;

	switch (receivable.status) {
		case 'pending':
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

	// 🟢 S’il n’y a jamais eu de relance => on envoie !
	if (!lastReminderAt) return true;

	const nextReminderTime = lastReminderAt.getTime() + delayMinutes * 60 * 1000;

	return now.getTime() >= nextReminderTime;
}

  
export async function AutomaticallySendReminders(): Promise<void> {
	try {
		const { data: receivables, error } = await supabase
			.from('receivables')
			.select('*, client:clients(*)')
			.in('status', ['pending', 'Relance 1', 'Relance 2', 'Relance 3', 'Relance finale', 'Relance préventive']) // ou selon tes statuts
			

		if (error) throw error;
		if (!receivables || receivables.length === 0) return;
		for (const receivable of receivables) {
			if (shouldSendReminder(receivable)) {
				console.log("SEND REMINDERS FORM RECEIVABLE"+receivable.client.company_name+" WITH CURRENT STATUS "+receivable.status);
				
				await sendManualReminder(receivable.id);
			}
		
		}
	} catch (err) {
		console.error('Erreur lors de l’envoi automatique des relances :', err);
	}
}
