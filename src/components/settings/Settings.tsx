import React, { useState } from 'react';
import { Mail, User, Bell, Shield } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js'; // Importer Elements
import { loadStripe } from '@stripe/stripe-js'; // Importer loadStripe
// Composants à créer ou importer
import EmailSettings from './EmailSettings';
import PasswordSettings from './SecuritySettings';
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
import SignatureSettings from './SenderSettings';
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
/*       { id: 'payment_method', name: 'Moyen de paiement', component: PaymentMethodSettings }, 
 */    ],
  },
  {
    id: 'reminders',
    name: 'Paramètres d’envoi de relances',
    icon: Bell,
    subTabs: [
      { id: 'sender', name: 'Personnaliser la signature', component: SignatureSettings },
	  { id: 'profile_rename', name: 'Configuration des profils', component: ReminderProfileSettings },
     // { id: 'auto_notifications', name: 'Activer/désactiver les notifications automatiques', component: AutoNotificationSettings },
    ],
  },
/*  
  {
    id: 'integrations',
    name: 'Intégrations',
    icon: Mail,
    subTabs: [
      { id: 'external_api', name: 'Connecter une API externe', component: ExternalApiSettings },
      { id: 'webhooks', name: 'Paramétrer Webhooks', component: WebhookSettings },
      { id: 'zapier', name: 'Connecter Zapier / Make', component: ZapierSettings }, 
    ],
  }*/,
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    subTabs: [
      { id: 'email_sms', name: 'Notifications email / SMS', component: NotificationSettings },
    //  { id: 'reminder_freq', name: 'Fréquence des rappels', component: ReminderFrequencySettings },
    ],
  },
/*   {
    id: 'advanced',
    name: 'Paramètres avancés',
    icon: Shield,
    subTabs: [
      { id: 'profile_rename', name: 'Configuration des profils', component: ReminderProfileSettings },
    ],
  }, */
];

export default function Settings() {
	const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id);
	const [activeSubTabId, setActiveSubTabId] = useState(sections[0]?.subTabs[0].id);
	const activeSection = sections.find((section) => section?.id === activeSectionId);
	const activeSubTab = activeSection?.subTabs.find((tab) => tab.id === activeSubTabId);
	const ActiveComponent = activeSubTab?.component || (() => <div>Aucun composant</div>);
  
	return (
	  <div className='p-6'>
		<h1 className='text-2xl font-bold text-gray-900 mb-6'>Paramètres</h1>
		<div className='bg-white rounded-lg shadow flex'>
		  {/* Menu latéral */}
		  <div className='w-64 border-r border-gray-200 p-4'>
			<nav className='flex flex-col space-y-2'>
			  {sections.map((section) => {
				const Icon = section.icon;
				return (
				  <button
					key={section.id}
					onClick={() => {
					  setActiveSectionId(section.id);
					  setActiveSubTabId(section.subTabs[0].id);
					}}
					className={`flex items-center px-4 py-2 rounded-md text-left ${
					  activeSectionId === section.id
						? 'bg-blue-100 text-blue-700 font-semibold'
						: 'text-gray-600 hover:bg-gray-100'
					}`}
				  >
					<Icon className='h-5 w-5 mr-3' />
					{section.name}
				  </button>
				);
			  })}
			</nav>
		  </div>
  
		  {/* Zone de contenu */}
		  <div className='flex-1 p-6'>
			{/* Sous-onglets */}
			<div className='flex space-x-4 border-b border-gray-200 mb-6'>
			  {activeSection?.subTabs.map((tab) => (
				<button
				  key={tab.id}
				  onClick={() => setActiveSubTabId(tab.id)}
				  className={`pb-2 border-b-2 text-sm ${
					activeSubTabId === tab.id
					  ? 'border-blue-600 text-blue-600 font-semibold'
					  : 'border-transparent text-gray-600 hover:text-gray-800'
				  }`}
				>
				  {tab.name}
				</button>
			  ))}
			</div>
  
			{/* Encapsuler le composant avec le provider Elements de Stripe */}
			{activeSubTabId === 'payment_method' ? (
			  <Elements stripe={stripePromise}>
				<ActiveComponent />
			  </Elements>
			) : (
			  <ActiveComponent />
			)}
		  </div>
		</div>
	  </div>
	);
  }


