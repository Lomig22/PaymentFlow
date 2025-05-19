export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const faqData: FaqItem[] = [
  {
    question: "Comment configurer les rappels de paiement automatiques ?",
    answer: "Pour configurer les rappels de paiement automatiques, accédez à Paramètres > Notifications > Rappels de paiement. Vous pourrez y définir le timing, la fréquence et le contenu de vos rappels. Vous pouvez créer différents modèles pour les différentes étapes des paiements en retard (par exemple, rappel amical, rappel ferme, dernier avis).",
    category: "features"
  },
  {
    question: "Puis-je personnaliser les modèles de rappel de paiement ?",
    answer: "Oui, vous pouvez entièrement personnaliser tous les modèles de rappel de paiement. Allez dans Paramètres > Modèles > Rappels de paiement pour modifier les modèles existants ou en créer de nouveaux. Vous pouvez utiliser des variables comme {{nom_client}}, {{numero_facture}} et {{date_echeance}} pour personnaliser vos messages.",
    category: "features"
  },
  {
    question: "Comment fonctionne le rapport de balance âgée des comptes clients ?",
    answer: "Le rapport de balance âgée classe vos factures impayées par ancienneté (0-30 jours, 31-60 jours, 61-90 jours et 90+ jours). Cela vous aide à identifier les factures en retard et à prioriser vos efforts de recouvrement. Vous pouvez accéder à ce rapport depuis le menu Rapports > Comptes clients > Balance âgée.",
    category: "features"
  },
  {
    question: "Quelle est la sécurité de mes données financières dans Payment-Flow ?",
    answer: "Payment-Flow utilise un chiffrement de niveau bancaire (SSL 256 bits) pour toutes les données en transit et au repos. Nous mettons en œuvre l'authentification multifactorielle, des contrôles d'accès basés sur les rôles et des audits de sécurité réguliers. Nos serveurs sont hébergés dans des centres de données sécurisés conformes aux normes SOC 2 Type II, PCI DSS et RGPD.",
    category: "technical"
  },
  {
    question: "Puis-je intégrer Payment-Flow à mon logiciel comptable ?",
    answer: "Oui, Payment-Flow s'intègre avec les logiciels comptables populaires comme QuickBooks, Xero, Sage et FreshBooks. Accédez à Paramètres > Intégrations pour configurer la connexion. Une fois intégré, vos données de facturation se synchroniseront automatiquement entre les systèmes, éliminant la nécessité de saisie manuelle.",
    category: "technical"
  },
  {
    question: "Comment mettre à jour mes informations de facturation ?",
    answer: "Pour mettre à jour vos informations de facturation, allez dans Paramètres > Compte > Facturation. Vous pouvez y mettre à jour votre mode de paiement, votre adresse de facturation et vos informations fiscales. Vous pouvez également consulter votre historique de facturation et télécharger les factures de votre abonnement Payment-Flow.",
    category: "billing"
  },
  {
    question: "Quels modes de paiement mes clients peuvent-ils utiliser ?",
    answer: "Payment-Flow prend en charge une large gamme de moyens de paiement, notamment les cartes de crédit/débit (Visa, Mastercard, American Express, Discover), les virements bancaires SEPA, les virements internationaux, PayPal et divers moyens de paiement locaux selon votre région. Vous pouvez activer ou désactiver les moyens de paiement dans Paramètres > Paiements.",
    category: "features"
  },
  {
    question: "Comment générer des rapports financiers ?",
    answer: "Pour générer des rapports financiers, accédez à la section Rapports dans la navigation principale. Vous pouvez y sélectionner différents rapports préétablis tels que Flux de trésorerie, Balance âgée, Historique des paiements et Efficacité du recouvrement. Vous pouvez personnaliser la période et d'autres paramètres, puis exporter les rapports en PDF, Excel ou CSV.",
    category: "features"
  },
  {
    question: "Puis-je ajouter des membres à mon équipe ?",
    answer: "Oui, vous pouvez ajouter des membres à votre compte Payment-Flow avec différents niveaux d'autorisation. Allez dans Paramètres > Membres de l'équipe > Ajouter un membre pour inviter des collègues. Vous pouvez attribuer des rôles tels qu'Administrateur, Gestionnaire, Comptable ou Observateur pour contrôler les actions qu'ils peuvent effectuer dans le système.",
    category: "account"
  },
  {
    question: "Que faire si j'oublie mon mot de passe ?",
    answer: "Si vous oubliez votre mot de passe, cliquez sur le lien 'Mot de passe oublié' sur la page de connexion. Saisissez votre adresse e-mail, et nous vous enverrons un lien de réinitialisation. Pour des raisons de sécurité, le lien expirera après 24 heures. Si vous ne recevez pas l'e-mail, vérifiez votre dossier spam ou contactez notre équipe support.",
    category: "account"
  }
];