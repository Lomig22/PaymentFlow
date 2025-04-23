import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'npm:nodemailer@6.10.0';
serve(async (req)=>{
  try {
    // Activer CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }
    const data = await req.json();
    const { settings, to, subject, html, invoice_pdf_url } = data.list[0];
    const host = settings.smtp_server;
    const port = parseInt(settings.smtp_port);
    const user = settings.smtp_username;
    const pass = settings.smtp_password;
    console.log('Envoi email avec settings server:', settings.smtp_server);
    if (!host || !port || !user || !pass) {
      console.error("Configuration SMTP incomplète :", {
        host,
        port,
        user,
        pass
      });
      throw new Error('Email configuration is missing, Please contact the administrator');
    }
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false,
      auth: {
        user: user,
        pass: pass
      }
    });
    await transporter.sendMail({
      from: settings.smtp_username,
      to: to,
      subject: subject,
      text: html,
      html: html,
      attachments: invoice_pdf_url ? [
        {
          filename: 'invoice.pdf',
          path: invoice_pdf_url
        }
      ] : undefined
    });
    // await client.send({
    // 	from: settings.smtp_username,
    // 	to: to,
    // 	subject: subject,
    // 	content: html,
    // 	html: html,
    // });
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erreur lors de l'envoi de l'email"
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500
    });
  }
});
