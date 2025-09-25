// @ts-nocheck
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
    if (!data || !Array.isArray(data.list) || data.list.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request body: expected { list: [ { settings, to, subject, html, invoice_pdf_url } ] }'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 400
      });
    }
    const { settings, to, subject, html, invoice_pdf_url } = data.list[0];
    const provider = String(settings?.provider_type || '').toLowerCase();
    let host = settings.smtp_server;
    let port = Number(settings.smtp_port) || 0;
    let user = settings.smtp_username;
    let pass = settings.smtp_password;
    let encryption = String(settings.smtp_encryption || '').toLowerCase();
    const debugEnabled = (((Deno as any)?.env?.get('SMTP_DEBUG') || '').toLowerCase() === 'true');

    // If client asks for platform defaults or some fields are missing, override with env defaults
    const needPlatformDefaults = provider === 'platform' || provider === 'default' || !host || !port || !user || !pass;
    if (needPlatformDefaults) {
      const envHost = (Deno as any)?.env?.get('DEFAULT_SMTP_HOST');
      const envPortRaw = (Deno as any)?.env?.get('DEFAULT_SMTP_PORT');
      const envPort = Number(envPortRaw || '0');
      const envUser = (Deno as any)?.env?.get('DEFAULT_SMTP_USERNAME');
      const envPass = (Deno as any)?.env?.get('DEFAULT_SMTP_PASSWORD');
      const envEnc  = ((Deno as any)?.env?.get('DEFAULT_SMTP_ENCRYPTION') || '').toLowerCase();

      host = envHost || host;
      port = envPort || port || 587;
      user = envUser || user;
      pass = envPass || pass;
      encryption = (envEnc || encryption || '').toLowerCase();

      if (debugEnabled) {
        console.log('SMTP env presence (platform defaults):', {
          hasEnvHost: !!envHost,
          hasEnvPort: !!envPortRaw,
          hasEnvUser: !!envUser,
          hasEnvPass: !!envPass,
          envEnc: envEnc || '(empty)'
        });
      }
    }
    // Normalize encryption if missing or set to 'auto'
    if (!encryption || encryption === 'auto') {
      if (port === 465) {
        encryption = 'ssl';
      } else if (port === 587) {
        encryption = 'tls';
      } else {
        encryption = 'tls';
      }
    }
    // 'ssl' => implicit TLS (secure=true, often port 465)
    // 'tls' => STARTTLS (explicit TLS upgrade on port 587) => secure=false + requireTLS=true
    const isSecure = encryption === 'ssl' || port === 465;
    console.log('Envoi email via SMTP:', { provider, host, port, encryption, usingPlatformDefaults: needPlatformDefaults, debug: debugEnabled });
    if (!host || !port || !user || !pass) {
      console.error("Configuration SMTP incomplète :", {
        host,
        port,
        hasUser: !!user,
        hasPass: !!pass
      });
      throw new Error('Email configuration is missing, Please contact the administrator');
    }
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure, // true pour SSL/TLS implicite (465) ou si explicitement demandé
      auth: { user, pass },
      // STARTTLS (TLS explicite) si smtp_encryption === 'tls' ou 'starttls'
      requireTLS: encryption === 'starttls' || encryption === 'tls',
      tls: (encryption === 'starttls' || encryption === 'tls') ? { rejectUnauthorized: false } : undefined,
      logger: debugEnabled,
      debug: debugEnabled,
    });
    if (debugEnabled) console.log('SMTP config:', { host, port, encryption, isSecure });
    try {
      const verifyResult = await transporter.verify();
      if (debugEnabled) console.log('SMTP verify:', verifyResult);
    } catch (verr) {
      console.error('SMTP verify error:', { message: (verr as any)?.message, code: (verr as any)?.code, response: (verr as any)?.response });
      // On continue quand même vers sendMail pour obtenir un message d'erreur plus précis côté serveur SMTP
    }
    const fromEmail = user; // ensure from matches effective username used to authenticate
    const fromHeader = settings.sender_display_name
      ? `${settings.sender_display_name} <${fromEmail}>`
      : fromEmail;
    await transporter.sendMail({
      from: fromHeader,
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
    const code = (error as any)?.code;
    const response = (error as any)?.response;
    const command = (error as any)?.command;
    console.error("Erreur lors de l'envoi de l'email:", { message: (error as any)?.message, code, command, response });
    return new Response(JSON.stringify({
      success: false,
      error: (error as any)?.message || "Erreur lors de l'envoi de l'email",
      code,
      command,
      response
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500
    });
  }
});
