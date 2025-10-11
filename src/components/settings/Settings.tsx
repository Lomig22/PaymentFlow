import React, { useEffect, useState } from "react";
import { Mail, User, Bell, Shield, Users, Landmark, LucideIcon } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js"; // Importer Elements
import { loadStripe } from "@stripe/stripe-js"; // Importer loadStripe
// Composants à créer ou importer
import EmailSettings from "./EmailSettings";
import { SecuritySettings } from "./SecuritySettings";
//import UserManagementSettings from './UserManagementSettings';

import {
  BillingInfoSettings,
  SubscriptionSettings,
  PaymentMethodSettings,
} from "./Billing";

/*
import AutoNotificationSettings from './AutoNotificationSettings';
 */
/* import BulkActionSettings from './BulkActionSettings';
import PostActionBehaviorSettings from './PostActionBehaviorSettings';

import ExternalApiSettings from './ExternalApiSettings';
import WebhookSettings from './WebhookSettings';
import ZapierSettings from './ZapierSettings'; */

import NotificationSettings from "./NotificationSettings";
//import ReminderFrequencySettings from './ReminderFrequencySettings';

import UnsavedChangesModal from "./UnsavedChangesModal"; // Modal pour changements non enregistrés
import ProfileSettings from "./ProfileSettings";
import SignatureSettings from "./SenderSettings";
import { useLocation } from "react-router-dom";
import DeleteAccount from "./DeleteAccount";
import MemberList from "./MemberList";
import { PaymentSync } from "./PaymentSync";
/* 
import GuideSettings from './GuideSettings';
import ContactSupportSettings from './ContactSupportSettings';
import FAQSettings from './FAQSettings'; */
const stripePromise = loadStripe("ta_clé_publique_stripe");

type OnDirtyChange = (dirty: boolean) => void;

type SubTab = { id: string, name: string, component: (props: { onDirtyChange?: OnDirtyChange }) => JSX.Element }

const sections = [
  {
    id: "account",
    name: "Paramètres du compte",
    icon: User,
    subTabs: [
      { id: "email", name: "Paramètre de l'email", component: EmailSettings },
      {
        id: "password",
        name: "Paramètre de sécurité",
        component: SecuritySettings,
      },
      {
        id: "account",
        name: "Information de l'utilisateur",
        component: ProfileSettings,
      },
      {
        id: "termination",
        name: "Résiliation de compte",
        component: DeleteAccount,
      }
      //    { id: 'users', name: 'Gestion des utilisateurs', component: UserManagementSettings },
    ],
  },
  {
    id: "reminders",
    name: "Paramètres d’envoi de relances",
    icon: Mail,
    subTabs: [
      {
        id: "sender",
        name: "Personnaliser la signature",
        component: SignatureSettings,
      },
      // { id: 'auto_notifications', name: 'Activer/désactiver les notifications automatiques', component: AutoNotificationSettings },
    ],
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    subTabs: [
      {
        id: "email_sms",
        name: "Notifications email / SMS",
        component: NotificationSettings,
      },
      //  { id: 'reminder_freq', name: 'Fréquence des rappels', component: ReminderFrequencySettings },
    ],
  },
  {
    id: "billing",
    name: "Paramètres de facturation",
    icon: Shield,
    subTabs: [
      {
        id: "billing_info",
        name: "Informations de facturation",
        component: BillingInfoSettings,
      },
      {
        id: "subscription",
        name: "Choix de l’abonnement",
        component: SubscriptionSettings,
      },
      /*       { id: 'payment_method', name: 'Moyen de paiement', component: PaymentMethodSettings },
       */
    ],
  },
  {
    id: "members",
    name: "Gestion des membres",
    icon: Users,
    subTabs: [
      {
        id: "list",
        name: "Liste des membres",
        component: MemberList,
      },
    ],
  }, {
    id: "integration-bancaire",
    name: "Intégration bancaire",
    version: "alpha",
    icon: Landmark,
    subTabs: [
      {
        id: "sync-Payment",
        name: "Synchronisation des paiements",
        component: PaymentSync
      }
    ]
  }
] as const satisfies { id: string, name: string, version?: "stable" | "alpha" | "beta", icon: LucideIcon, subTabs: SubTab[] }[];
type SettingsProps = {
  initialSectionId?: string;
  initialSubTabId?: string;
};
export default function Settings() {
  // --- Ajout pour la gestion des changements non enregistrés ---
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingSectionId, setPendingSectionId] = useState<string | null>(null);
  const [pendingSubTabId, setPendingSubTabId] = useState<string | null>(null);

  // Callback pour détecter des changements dans ReminderProfileSettings
  const handleReminderProfileDirty = (dirty: boolean) => {
    setUnsavedChanges(dirty);
  };
  // Helper: l’onglet courant nécessite-t-il un avertissement ?
  const isUnsavedTrackedActive = () => {
    return (
      (activeSectionId === "reminders" && activeSubTabId === "sender") ||
      (activeSectionId === "account" && activeSubTabId === "account")
    );
  };
  // Callback pour forcer la sauvegarde ou quitter
  const handleLeaveReminderSettings = () => {
    setShowUnsavedModal(false);
    setUnsavedChanges(false);
    if (pendingSectionId) setActiveSectionId(pendingSectionId);
    if (pendingSubTabId) setActiveSubTabId(pendingSubTabId);
    setPendingSectionId(null);
    setPendingSubTabId(null);
  };
  const handleStayReminderSettings = () => {
    setShowUnsavedModal(false);
    setPendingSectionId(null);
    setPendingSubTabId(null);
  };

  const location = useLocation();
  const initialSectionId = location.state?.initialSectionId;
  const initialSubTabId = location.state?.initialSubTabId
  const [activeSectionId, setActiveSectionId] = useState(
    initialSectionId || sections[0]?.id
  );
  const [activeSubTabId, setActiveSubTabId] = useState(
    initialSubTabId || sections[0]?.subTabs[0].id
  );
  const activeSection = sections.find(
    (section?) => section?.id === activeSectionId
  );
  const activeSubTab = activeSection?.subTabs.find(
    (tab) => tab.id === activeSubTabId
  );
  const ActiveComponent =
    activeSubTab?.component || (() => <div>Aucun composant</div>);
  // À chaque changement de location, mettre à jour les états
  useEffect(() => {
    if (location.state?.initialSectionId) {
      setActiveSectionId(location.state.initialSectionId);
    }
    if (location.state?.initialSubTabId) {
      setActiveSubTabId(location.state.initialSubTabId);
    }
  }, [location]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>
      <div className="bg-white rounded-lg shadow flex">
        {/* Menu latéral */}
        <div className="w-64 border-r border-gray-200 p-4">
          <nav className="flex flex-col space-y-2">
            {sections.map(section => {
              const Icon = section?.icon;
              return (
                <button
                  key={section?.id}
                  onClick={() => {
                    // Si on quitte une section avec des changements non enregistrés
                    if (unsavedChanges && isUnsavedTrackedActive() && (section?.id !== activeSectionId)) {
                      setShowUnsavedModal(true);
                      setPendingSectionId(section?.id ?? null);
                      setPendingSubTabId(section?.subTabs[0]?.id ?? null);
                      return;
                    }
                    setActiveSectionId(section?.id);
                    setActiveSubTabId(section?.subTabs[0].id);
                  }}
                  className={`flex items-center px-4 py-2 rounded-md text-left ${activeSectionId === section?.id
                    ? `${"version" in section && section?.version === "alpha" ? " bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"} font-semibold`
                    : `${"version" in section && section?.version === "alpha" ? "text-red-600" : "text-gray-600"} hover:bg-gray-100`
                    }`}
                >
                  {Icon ? <Icon className="h-5 w-5 mr-3" /> : null}
                  {section?.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zone de contenu */}
        <div className="flex-1 p-6">
          {/* Sous-onglets */}
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            {activeSection?.subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  // Si on quitte un sous-onglet avec des changements non enregistrés
                  if (unsavedChanges && isUnsavedTrackedActive() && tab.id !== activeSubTabId) {
                    setShowUnsavedModal(true);
                    setPendingSectionId(activeSectionId);
                    setPendingSubTabId(tab.id);
                    return;
                  }
                  setActiveSubTabId(tab.id);
                }}
                className={`pb-2 border-b-2 text-sm ${activeSubTabId === tab.id
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Encapsuler le composant avec le provider Elements de Stripe */}
          {activeSubTabId === "payment_method" ? (
            <Elements stripe={stripePromise}>
              <ActiveComponent />
            </Elements>
          ) : (
            // Injection du callback dans SenderSettings (relances) et ProfileSettings (compte)
            activeSectionId === "reminders" && activeSubTabId === "sender" ? (
              <SignatureSettings onDirtyChange={handleReminderProfileDirty} />
            ) : activeSectionId === "account" && activeSubTabId === "account" ? (
              <ProfileSettings onDirtyChange={handleReminderProfileDirty} />
            ) : (
              <ActiveComponent />
            )
          )}
          {/* Modal pour changements non enregistrés */}
          <UnsavedChangesModal
            open={showUnsavedModal}
            onStay={handleStayReminderSettings}
            onLeave={handleLeaveReminderSettings}
          />
        </div>
      </div>
    </div>
  );
}
