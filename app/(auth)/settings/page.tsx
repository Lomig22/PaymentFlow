'use client';
import React, { useEffect, useRef, useState } from "react";
import { Mail, User, Bell, Shield, Users, Landmark, LucideIcon } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js"; // Importer Elements
import { loadStripe } from "@stripe/stripe-js"; // Importer loadStripe
// Composants à créer ou importer
import EmailSettings from "./EmailSettings";
import { SecuritySettings } from "../../../components/settings/SecuritySettings";
//import UserManagementSettings from './UserManagementSettings';

import {
  BillingInfoSettings,
  SubscriptionSettings,
} from "../../../components/settings/Billing";

/*
import AutoNotificationSettings from './AutoNotificationSettings';
 */
/* import BulkActionSettings from './BulkActionSettings';
import PostActionBehaviorSettings from './PostActionBehaviorSettings';

import ExternalApiSettings from './ExternalApiSettings';
import WebhookSettings from './WebhookSettings';
import ZapierSettings from './ZapierSettings'; */

import NotificationSettings from "../../../components/settings/NotificationSettings";
//import ReminderFrequencySettings from './ReminderFrequencySettings';

import UnsavedChangesModal from "../../../components/settings/UnsavedChangesModal"; // Modal pour changements non enregistrés
import ProfileSettings from "../../../components/settings/ProfileSettings";
import SignatureSettings from "../../../components/settings/SenderSettings";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DeleteAccount from "../../../components/settings/DeleteAccount";
import MemberList from "../../../components/settings/MemberList";
import { PaymentSync } from "../../../components/settings/PaymentSync";
import SageSettings from "../../../components/settings/SageSettings";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- Ajout pour la gestion des changements non enregistrés ---
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingSectionId, setPendingSectionId] = useState<string | null>(null);
  const [pendingSubTabId, setPendingSubTabId] = useState<string | null>(null);

  const prevPathRef = useRef(pathname);


  // Callback pour détecter des changements dans ReminderProfileSettings
  const handleReminderProfileDirty = (dirty: boolean) => {
    setUnsavedChanges(dirty);
  };
  // Helper: l’onglet courant nécessite-t-il un avertissement ?
  const isUnsavedTrackedActive = () => {
    return (
      (activeSectionId === "reminders" && activeSubTabId === "sender") ||
      (activeSectionId === "account" && activeSubTabId === "account") ||
      (activeSectionId === "account" && activeSubTabId === "email") ||
      (activeSectionId === "account" && activeSubTabId === "password") ||
      (activeSectionId === "notifications" && activeSubTabId === "email_sms") ||
      (activeSectionId === "billing" && activeSubTabId === "billing_info")
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

  const initialSectionId = searchParams?.get("initialSectionId");
  const initialSubTabId = searchParams?.get("initialSubTabId");
  const [activeSectionId, setActiveSectionId] = useState(
    initialSectionId || sections[0]?.id
  );
  const [activeSubTabId, setActiveSubTabId] = useState(
    initialSubTabId || sections[0]?.subTabs[0].id
  );
  const activeSection = sections.find(
    (section) => section?.id === activeSectionId
  );
  const activeSubTab = activeSection?.subTabs.find(
    (tab) => tab.id === activeSubTabId
  );
  const ActiveComponent =
    activeSubTab?.component || (() => <div>Aucun composant</div>);
  // À chaque changement de location, mettre à jour les états
  useEffect(() => {
    if (initialSectionId) {
      setActiveSectionId(initialSectionId);
    }
    if (initialSubTabId) {
      setActiveSubTabId(initialSubTabId);
    }
  }, [searchParams]);

  // Miroir global pour Layout: expose l'état dirty dans sessionStorage
  useEffect(() => {
    try {
      if (unsavedChanges && isUnsavedTrackedActive()) {
        sessionStorage.setItem('unsaved:settings', '1');
      } else {
        sessionStorage.removeItem('unsaved:settings');
      }
    } catch { }
  }, [unsavedChanges, activeSectionId, activeSubTabId]);

  // Garde de navigation: si on quitte /settings avec des changements non sauvegardés
  useEffect(() => {
    const prevPath = prevPathRef.current;
    const nextPath = pathname;
    // On détecte un départ depuis /settings
    if (
      prevPath === "/settings" &&
      nextPath !== "/settings" &&
      unsavedChanges
    ) {
      // Afficher l’alerte et, si annulé, revenir sur /settings
      Swal.fire({
        title: 'Modifications non enregistrées',
        text: 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continuer sans enregistrer',
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        customClass: {
          confirmButton: 'bg-yellow-600 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-700',
          cancelButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        },
      }).then((result) => {
        if (!result.isConfirmed) {
          // Revenir immédiatement sur /settings
          router.replace(prevPath);
        } else {
          // L’utilisateur confirme le départ: on peut réinitialiser l’état
          setUnsavedChanges(false);
        }
      });
    }
    prevPathRef.current = nextPath;
  }, [pathname]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>
      <div className="bg-white rounded-lg shadow flex">
        {/* Menu latéral */}
        <div className="w-64 border-r border-gray-200 p-4">
          <nav className="flex flex-col space-y-2">
            {
              sections.map((section?) => {
                const Icon = section?.icon;
                return (
                  <button
                    key={section?.id}
                    onClick={() => {
                      // Si on quitte "Paramètres d’envoi de relances" avec des changements non enregistrés
                      if (activeSectionId === "reminders" && unsavedChanges && section?.id !== "reminders") {
                        setShowUnsavedModal(true);
                        setPendingSectionId(section?.id ?? null);
                        setPendingSubTabId(section?.subTabs[0]?.id ?? null);
                        return;
                      }
                      if (section) {
                        setActiveSectionId(section?.id);
                        setActiveSubTabId(section?.subTabs[0].id);
                      }
                    }}
                    className={`flex items-center px-4 py-2 rounded-md text-left ${activeSectionId === section?.id
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {Icon ? <Icon className="h-5 w-5 mr-3" /> : null}
                    {section?.name}
                  </button>
                );
              })
            }
          </nav >
        </div >

        {/* Zone de contenu */}
        < div className="flex-1 p-6" >
          {/* Sous-onglets */}
          < div className="flex space-x-4 border-b border-gray-200 mb-6" >
            {
              activeSection?.subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    // Si on quitte un sous-menu de "Paramètres d’envoi de relances" avec des changements non enregistrés
                    if (activeSectionId === "reminders" && unsavedChanges && tab.id !== activeSubTabId) {
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
              ))
            }
          </div >

          {/* Encapsuler le composant avec le provider Elements de Stripe */}
          {
            activeSubTabId === "payment_method" ? (
              <Elements stripe={stripePromise}>
                <ActiveComponent />
              </Elements>
            ) : (
              // Injection du callback dans SenderSettings (relances) et ProfileSettings (compte)
              activeSectionId === "reminders" && activeSubTabId === "sender" ? (
                <SignatureSettings onDirtyChange={handleReminderProfileDirty} />
              ) : activeSectionId === "account" && activeSubTabId === "account" ? (
                <ProfileSettings onDirtyChange={handleReminderProfileDirty} />
              ) : activeSectionId === "account" && activeSubTabId === "email" ? (
                <EmailSettings onDirtyChange={handleReminderProfileDirty} />
              ) : activeSectionId === "account" && activeSubTabId === "password" ? (
                <SecuritySettings onDirtyChange={handleReminderProfileDirty} />
              ) : activeSectionId === "notifications" && activeSubTabId === "email_sms" ? (
                <NotificationSettings onDirtyChange={handleReminderProfileDirty} />
              ) : activeSectionId === "billing" && activeSubTabId === "billing_info" ? (
                <BillingInfoSettings onDirtyChange={handleReminderProfileDirty} />
              ) : (
                <ActiveComponent />
              )
            )
          }
          {/* Modal pour changements non enregistrés */}
          <UnsavedChangesModal
            open={showUnsavedModal}
            onStay={handleStayReminderSettings}
            onLeave={handleLeaveReminderSettings}
          />
        </div >
      </div >
    </div >
  );
}
