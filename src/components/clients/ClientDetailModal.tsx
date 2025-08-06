import React from "react";
import { useNavigate } from "react-router-dom";
// import { Dialog } from "@headlessui/react"; // Supprimé car non disponible
import ManualReminderModal from "../receivables/ManualReminderModal";
import { sendManualReminder } from "../../lib/reminderService";
import { motion } from "framer-motion";
import {
  X,
  Building,
  BadgeInfo,
  Briefcase,
  Globe,
  MapPin,
  Phone,
  Mail,
  StickyNote,
  Calendar,
  Wrench,
  FileText,
} from "lucide-react";

interface ClientDetailModalProps {
  client: any;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!client) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  interface FieldProps {
  label: string;
  value: string;
  Icon?: React.ElementType;
  isLink?: boolean;
}
const Field: React.FC<FieldProps> = ({ label, value, Icon, isLink = false }) => (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-5 h-5 text-blue-500 mt-1" />}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-blue-600 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-base font-medium text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );

  interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {children}
      </div>
    </div>
  );

  interface ReminderBadgeProps {
  label: string;
  enabled: boolean;
  delay?: { m?: number };
}
const ReminderBadge: React.FC<ReminderBadgeProps> = ({ label, enabled, delay }) => (
    <div className="flex items-center gap-4">
      <span className="w-32 text-sm text-gray-600">{label}</span>
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {enabled ? "Activé" : "Désactivé"}
      </span>
      {enabled && delay?.m !== undefined && (
        <span className="text-sm text-gray-500">({delay.m} min)</span>
      )}
    </div>
  );

  const [showReminderModal, setShowReminderModal] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const handleSendReminder = async (subject: string, content: string, signature: string) => {
    if (!client || !client.id) return false;
    setSending(true);
    // You may want to adapt this to fetch the correct receivableId for the client
    const success = await sendManualReminder(client.id, subject, content);
    setSending(false);
    return success;
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 overflow-y-auto max-h-[90vh]"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-2xl font-semibold text-gray-800">
                <FileText className="w-6 h-6 text-blue-600" />
                Détails du client
              </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <Section title="Informations générales">
            <Field
              label="Entreprise"
              value={client.company_name}
              Icon={Building}
            />
            <Field
              label="Code client"
              value={client.client_code}
              Icon={BadgeInfo}
            />
            <Field label="Secteur" value={client.industry} Icon={Briefcase} />
            <Field
              label="Site web"
              value={client.website}
              Icon={Globe}
              isLink
            />
            <Field
              label="Adresse"
              value={`${client.address}, ${client.postal_code} ${client.city}, ${client.country}`}
              Icon={MapPin}
            />
          </Section>

          <Section title="Contact">
            <Field label="Téléphone" value={client.phone} Icon={Phone} />
            <Field label="Email" value={client.email} Icon={Mail} />
          </Section>

          <Section title="Statut des rappels">
            <ReminderBadge
              label="Pré-rappel"
              enabled={client.pre_reminder_enable}
              delay={client.pre_reminder_delay}
            />
            <ReminderBadge
              label="Rappel 1"
              enabled={client.reminder_enable_1}
              delay={client.reminder_delay_1}
            />
            <ReminderBadge
              label="Rappel 2"
              enabled={client.reminder_enable_2}
              delay={client.reminder_delay_2}
            />
            <ReminderBadge
              label="Rappel 3"
              enabled={client.reminder_enable_3}
              delay={client.reminder_delay_3}
            />
            <ReminderBadge
              label="Rappel final"
              enabled={client.reminder_enable_final}
              delay={client.reminder_delay_final}
            />
          </Section>

          <Section title="Dates de rappel">
            <Field
              label="Pré-rappel"
              value={formatDate(client.pre_reminder_date)}
              Icon={Calendar}
            />
            <Field
              label="Rappel 1"
              value={formatDate(client.reminder_date_1)}
              Icon={Calendar}
            />
            <Field
              label="Rappel 2"
              value={formatDate(client.reminder_date_2)}
              Icon={Calendar}
            />
            <Field
              label="Rappel 3"
              value={formatDate(client.reminder_date_3)}
              Icon={Calendar}
            />
            <Field
              label="Rappel final"
              value={formatDate(client.reminder_date_final)}
              Icon={Calendar}
            />
          </Section>

          <Section title="Autres">
  <Field
    label="Notes"
    value={client.notes || "Aucune note"}
    Icon={StickyNote}
  />
  <Field
    label="Créé le"
    value={formatDate(client.created_at)}
    Icon={Calendar}
  />
  <Field
    label="Modifié le"
    value={formatDate(client.updated_at)}
    Icon={Wrench}
  />
</Section>
<div className="w-full flex flex-col items-center mt-6">
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow transition-colors text-lg"
              onClick={() => {
  navigate('/receivables', {
    state: { openReminderForClient: client.id }
  });
}}
              type="button"
            >
              <Mail className="w-5 h-5" aria-label="Mail" />
              Relancer
            </button>
            {(!client.company_name || !client.email) && (
              <div className="mt-2 text-sm text-red-600 text-center">
                Attention : informations client incomplètes.<br />
                { !client.company_name && 'Nom de l’entreprise manquant. '}
                { !client.email && 'Email manquant.'}
              </div>
            )}
          </div>
          {showReminderModal && (
            <ManualReminderModal
              isOpen={showReminderModal}
              onClose={() => setShowReminderModal(false)}
              client={client}
              onSendReminder={handleSendReminder}
              loading={sending}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientDetailModal;