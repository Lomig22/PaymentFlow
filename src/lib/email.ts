interface EmailSettings {
	provider_type: string;
	smtp_username: string;
	smtp_password: string;
	smtp_server: string;
	smtp_port: number;
	smtp_encryption: string;
	email_signature?: string;
}

import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const sendEmail = async (
	settings: EmailSettings,
	to: string,
	subject: string,
	htmlContent: string,
	invoice_pdf_url?: string,
	emailId?: string
): Promise<boolean> => {
	try {
		// Récupérer le token en cours via le client Supabase
		const { data: { session } } = await supabase.auth.getSession();
		let access_token = session?.access_token;
		if (!access_token) {
			// Fallback ultime: tenter de lire la clé de stockage Supabase spécifique à l'hôte
			try {
				const host = new URL(supabaseUrl).host;
				const raw = localStorage.getItem(`paymentflow-auth:${host}`) || localStorage.getItem('paymentflow-auth');
				if (raw) {
					const parsed = JSON.parse(raw);
					access_token = parsed?.currentSession?.access_token || parsed?.access_token || null;
				}
			} catch { }
		}

		if (!access_token) {
			throw new Error('Session utilisateur introuvable pour l’envoi d’email');
		}

		// Utiliser l'ID de tracking fourni si présent, sinon en générer un
		const emailTrackingId = emailId || uuidv4();
		const trackingPixel = `<img src="${supabaseUrl}/functions/v1/email-open-tracker?id=${emailTrackingId}&t=${Date.now()}" width="1" height="1" style="opacity:0;width:1px;height:1px;border:0;" alt="" />`;

		const res = await fetch(
			`${supabaseUrl}/functions/v1/send-smtp-email`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
					...(supabaseAnonKey ? { apikey: supabaseAnonKey } : {}),
				},
				body: JSON.stringify({
					list: [
						{
							settings,
							to,
							subject,
							html: `
			      <!DOCTYPE html>
			      <html>
			        <head>
			          <meta charset="utf-8">
			          <title>${subject}</title>
			        </head>
			        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">
			          <div style="max-width: 600px; margin: 0 auto;">
			            ${htmlContent}
			            ${trackingPixel}
			            ${settings.email_signature
									? `
				              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
				                ${settings.email_signature}
				              </div>
				            `
									: ''
								}
			          </div>
			        </body>
			      </html>
			    `,
							invoice_pdf_url: invoice_pdf_url,
						},
					],
				}),
			}
		);
		console.log(JSON.stringify({
			list: [
				{
					settings,
					to,
					subject,
					html: "<html>...</html>",
					invoice_pdf_url,
				}
			]
		}));

		const data = await res.json();
		const error = data?.failures;
		if (error) {
			console.error('Erreur Supabase Edge Function:', error);
			throw error;
		}

		if (!data?.success) {
			throw new Error(data?.error || "Échec de l'envoi de l'email");
		}

		return true;
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email:", error);
		throw error;
	}
};
