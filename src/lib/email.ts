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

export const sendEmail = async (
	settings: EmailSettings,
	to: string,
	subject: string,
	htmlContent: string,
	invoice_pdf_url?: string
): Promise<boolean> => {
	try {
		const auth_data = localStorage.getItem('paymentflow-auth');
		if (auth_data) {
			const access_token = JSON.parse(auth_data).access_token;
			// Générer un identifiant unique pour le tracking
			const emailTrackingId = uuidv4();
			const trackingPixel = `<img src=\"https://rsomeerndudkhyhpigmn.supabase.co/functions/v1/email-open-tracker?id=${emailTrackingId}\" width=\"1\" height=\"1\" style=\"display:none;\" alt=\"\" />`;

			const res = await fetch(
				'https://rsomeerndudkhyhpigmn.supabase.co/functions/v1/send-smtp-email',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${access_token}`,
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
			            ${
										settings.email_signature
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
		}
		return false;
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email:", error);
		throw error;
	}
};
