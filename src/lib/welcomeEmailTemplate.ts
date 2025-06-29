// Animated and emoji-rich HTML welcome email template for PaymentFlow
export function getWelcomeEmailHtml(userEmail: string) {
  return `
    <div style="background: linear-gradient(135deg,#e0e7ff 0%,#f0fff4 100%);padding:32px 0;text-align:center;min-height:100vh;">
      <div style="max-width:520px;margin:0 auto;background:white;border-radius:18px;padding:32px 24px;box-shadow:0 8px 24px rgba(80,80,180,0.08);">
        <h1 style="font-size:2.2em;font-weight:900;margin-bottom:0.5em;letter-spacing:-1px;color:#2563eb;">
          🎉 Bienvenue sur PaymentFlow ! 🎉
        </h1>
        <div style="font-size:1.25em;margin-bottom:1.5em;">
          <span role="img" aria-label="spark">✨</span>
          Merci d'avoir rejoint la communauté <b>PaymentFlow</b> !<br/>
          Nous sommes <span style="color:#059669;font-weight:600;">ravis</span> de vous compter parmi nos utilisateurs.<br/>
          <span role="img" aria-label="party">🥳</span>
        </div>
        <div style="margin-bottom:2em;">
          <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3JzZ3ZxN2ZqM2E3d3J6c3B2eGx0eGxqZ2R6Z2RjYjJvNnNubGZrbiZjdD1n/ASd0Ukj0y3qMM/giphy.gif"
               alt="Welcome animation" style="width:220px;border-radius:12px;box-shadow:0 2px 8px #e0e7ff;margin-bottom:18px;"/>
        </div>
        <p style="font-size:1.1em;line-height:1.6;margin-bottom:1.2em;">
          <b>Votre essai gratuit est activé !</b><br/>
          Profitez de toutes les fonctionnalités sans engagement pendant 14 jours.<br/>
          <span style="font-size:1.7em;">🚀</span>
        </p>
        <div style="margin:2em 0;">
          <a href="https://app.payment-flow.fr/login" style="display:inline-block;padding:14px 32px;background:#2563eb;color:white;border-radius:8px;font-size:1.1em;text-decoration:none;font-weight:700;box-shadow:0 2px 8px #c7d2fe;transition:background 0.2s;">Se connecter à mon espace</a>
        </div>
        <p style="color:#64748b;font-size:0.95em;margin-top:2em;">
          Si vous avez des questions, répondez à cet email ou contactez-nous via le chat intégré.<br/>
          <span style="font-size:1.2em;">💬</span>
        </p>
        <div style="margin-top:2.5em;font-size:1em;color:#6d28d9;">
          L'équipe PaymentFlow vous souhaite la bienvenue !<br/>
          <span style="font-size:1.5em;">🌈🤗</span>
        </div>
      </div>
    </div>
  `;
}
