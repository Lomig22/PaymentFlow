import React, { useState } from 'react';
import { Mail, User, Bell, Shield } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js'; // Importer Elements
import { loadStripe } from '@stripe/stripe-js'; // Importer loadStripe
// Composants à créer ou importer
import EmailSettings from './EmailSettings';
import PasswordSettings from './SecuritySettings';
import SenderSettings from './SenderSettings';
//import UserManagementSettings from './UserManagementSettings';

import {
	BillingInfoSettings,
	SubscriptionSettings,
	PaymentMethodSettings,
  } from './Billing';
  

/*
import AutoNotificationSettings from './AutoNotificationSettings';
 */
/* import BulkActionSettings from './BulkActionSettings';
import PostActionBehaviorSettings from './PostActionBehaviorSettings';

import ExternalApiSettings from './ExternalApiSettings';
import WebhookSettings from './WebhookSettings';
import ZapierSettings from './ZapierSettings'; */

import NotificationSettings from './NotificationSettings';
//import ReminderFrequencySettings from './ReminderFrequencySettings';

import ReminderProfileSettings from './ReminderProfileSettings';
import ProfileSettings from './ProfileSettings';
/* 
import GuideSettings from './GuideSettings';
import ContactSupportSettings from './ContactSupportSettings';
import FAQSettings from './FAQSettings'; */
const stripePromise = loadStripe('ta_clé_publique_stripe');

const sections = [
  {
    id: 'account',
    name: 'Paramètres du compte',
    icon: User,
    subTabs: [
      { id: 'email', name: "Paramètre de l'email", component: EmailSettings },
	  { id: 'password', name: "Paramètre de sécurité", component: PasswordSettings },
	  { id: 'account', name: "Information de l'utilisateur", component: ProfileSettings },
    
	 
  //    { id: 'users', name: 'Gestion des utilisateurs', component: UserManagementSettings },
    ],
  },
  {
    id: 'billing',
    name: 'Paramètres de facturation',
    icon: Shield,
    subTabs: [
       { id: 'billing_info', name: 'Informations de facturation', component: BillingInfoSettings },
      { id: 'subscription', name: 'Choix de l’abonnement', component: SubscriptionSettings },
      { id: 'payment_method', name: 'Moyen de paiement', component: PaymentMethodSettings }, 
    ],
  },
  {
    id: 'reminders',
    name: 'Paramètres d’envoi de relances',
    icon: Bell,
    subTabs: [
      { id: 'sender', name: 'Personnaliser l’expéditeur', component: SenderSettings },
     // { id: 'auto_notifications', name: 'Activer/désactiver les notifications automatiques', component: AutoNotificationSettings },
    ],
  },
  {
    id: 'bulk_actions',
    name: 'Actions groupées',
    icon: Bell,
    subTabs: [
/*       { id: 'available_actions', name: 'Définir les actions disponibles', component: BulkActionSettings },
      { id: 'behavior_after_action', name: 'Comportement après action', component: PostActionBehaviorSettings }, */
    ],
  },
  {
    id: 'integrations',
    name: 'Intégrations',
    icon: Mail,
    subTabs: [
/*       { id: 'external_api', name: 'Connecter une API externe', component: ExternalApiSettings },
      { id: 'webhooks', name: 'Paramétrer Webhooks', component: WebhookSettings },
      { id: 'zapier', name: 'Connecter Zapier / Make', component: ZapierSettings }, */
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    subTabs: [
      { id: 'email_sms', name: 'Notifications email / SMS', component: NotificationSettings },
    //  { id: 'reminder_freq', name: 'Fréquence des rappels', component: ReminderFrequencySettings },
    ],
  },
  {
    id: 'advanced',
    name: 'Paramètres avancés',
    icon: Shield,
    subTabs: [
      { id: 'profile_rename', name: 'Renommer les profils', component: ReminderProfileSettings },
    ],
  },
  {
    id: 'support',
    name: 'Aide et Support',
    icon: User,
    subTabs: [
/*       { id: 'guide', name: 'Guide d’utilisation', component: GuideSettings },
      { id: 'contact', name: 'Contacter le support', component: ContactSupportSettings },
      { id: 'faq', name: 'FAQ / Centre de formation', component: FAQSettings }, */
    ],
  },
];

export default function Settings() {
	const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
	const [activeSubTabId, setActiveSubTabId] = useState(sections[0].subTabs[0].id);
  
	const activeSection = sections.find((section) => section.id === activeSectionId);
	const activeSubTab = activeSection?.subTabs.find((tab) => tab.id === activeSubTabId);
	const ActiveComponent = activeSubTab?.component || (() => <div>Aucun composant</div>);
  
  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>Paramètres</h1>
      <div className='bg-white rounded-lg shadow divide-y divide-gray-200'>
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = activeSectionId === section.id;
  
          return (
            <div key={section.id}>
              {/* En-tête de l'accordéon */}
              <button
                onClick={() => {
                  setActiveSectionId(isOpen ? null : section.id);
                  if (!isOpen) setActiveSubTabId(section.subTabs[0].id);
                }}
                className='w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 focus:outline-none'
              >
                <div className='flex items-center space-x-4 text-gray-800 font-semibold'>
                  <Icon className='h-5 w-5 text-blue-600' />
                  <span>{section.name}</span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 01.7.3l5 5a1 1 0 01-1.4 1.4L10 5.42 5.7 9.7A1 1 0 014.3 8.3l5-5A1 1 0 0110 3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
  
              {/* Contenu de l'accordéon */}
              {isOpen && (
                <div className='px-6 pb-6'>
                  <p className='text-sm text-gray-500 mb-4'>
                    {section.description || "Ajustez les paramètres liés à cette section."}
                  </p>
                  <div className='space-y-2'>
                    {section.subTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTabId(tab.id)}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                          activeSubTabId === tab.id
                            ? 'bg-blue-100 text-blue-800 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
  
                  {/* Affichage du composant sélectionné */}
                  <div className='mt-4'>
                    {activeSubTabId === 'payment_method' ? (
                      <Elements stripe={stripePromise}>
                        <ActiveComponent />
                      </Elements>
                    ) : (
                      <ActiveComponent />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
  
  
  }


