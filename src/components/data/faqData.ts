export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const faqData: FaqItem[] = [
  {
    "question": "Comment configurer les rappels de paiement automatiques ?",
    "answer": "Pour configurer les rappels de paiement automatiques, accédez à Créances > menu ... sur la créance à rappeler > Paramètres de relance. Vous pourrez y définir les dates et les contenus de vos rappels.",
    "category": "features"
  }
  
  ,
  {
    "question": "Qu'est-ce qu'un profil de rappel ?",
    "answer": "Un profil de rappel permet de définir automatiquement les dates de relance en fonction de la première relance. Pour les créer, allez dans Paramètres > Paramètres d'envoi de relances > Configuration des profils. Vous pouvez définir les délais entre les relances automatiques.",
    "category": "features"
  }
  ,
  {
    question: "Comment fonctionne le rapport de balance âgée des comptes clients ?",
    answer: "Le rapport de balance âgée classe vos factures impayées par ancienneté (0-30 jours, 31-60 jours, 61-90 jours et 90+ jours). Cela vous aide à identifier les factures en retard et à prioriser vos efforts de recouvrement. Vous pouvez accéder à ce rapport depuis le menu Tableau de bord",
    category: "features"
  }/* ,
  {
    question: "Quelle est la sécurité de mes données financières dans Payment-Flow ?",
    answer: "Payment-Flow utilise un chiffrement de niveau bancaire (SSL 256 bits) pour toutes les données en transit et au repos. Nous mettons en œuvre l'authentification multifactorielle, des contrôles d'accès basés sur les rôles et des audits de sécurité réguliers. Nos serveurs sont hébergés dans des centres de données sécurisés conformes aux normes SOC 2 Type II, PCI DSS et RGPD.",
    category: "technical"}
   */,
   {
    question: "Puis-je intégrer mes données comptables dans Payment-Flow ?",
    answer: "Oui, vous pouvez effectuer l'intégration comptable en important les données via un fichier CSV ou par saisie manuelle.",
    category: "technical"
  }
  ,
  {
    question: "Comment mettre à jour mes informations de facturation ?",
    answer: "Pour mettre à jour vos informations de facturation, allez dans Paramètres > Paramètres de facturation. Vous pouvez y mettre à jour vos informations de paiement (Adresse, Entreprise, SIRET)",
    category: "billing"
  }/* ,
  {
    question: "Quels modes de paiement mes clients peuvent-ils utiliser ?",
    answer: "Payment-Flow prend en charge une large gamme de moyens de paiement, notamment les cartes de crédit/débit (Visa, Mastercard, American Express, Discover), les virements bancaires SEPA, les virements internationaux, PayPal et divers moyens de paiement locaux selon votre région. Vous pouvez activer ou désactiver les moyens de paiement dans Paramètres > Paiements.",
    category: "features"
  } ,
  {
    question: "Comment afficher les rapports financiers ?",
    answer: "Pour générer des rapports financiers, accédez à la section Rapports dans la navigation principale. Vous pouvez y sélectionner différents rapports préétablis tels que Flux de trésorerie, Balance âgée, Historique des paiements et Efficacité du recouvrement. Vous pouvez personnaliser la période et d'autres paramètres, puis exporter les rapports en PDF, Excel ou CSV.",
    category: "feature"
  }*/,
  {
    question: "Puis-je ajouter des membres à mon équipe ?",
    answer: "Oui, vous pouvez ajouter des membres à votre compte Payment-Flow. Allez dans Paramètres > Gestion des membres > Ajouter un membre pour inviter des collègues.",
    category: "account"
  },
  {
    question: "Que faire si j'oublie mon mot de passe ?",
    answer: "Si vous oubliez votre mot de passe, cliquez sur le lien 'Mot de passe oublié' sur la page de connexion. Saisissez votre adresse e-mail, et nous vous enverrons un lien de réinitialisation. Pour des raisons de sécurité, le lien expirera après 24 heures. Si vous ne recevez pas l'e-mail, vérifiez votre dossier spam ou contactez notre équipe support.",
    category: "account"
  }
];