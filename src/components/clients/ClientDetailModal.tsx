import React from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { XCircle, CalendarDays, Globe, Mail, Phone } from "lucide-react";
import { h1 } from "framer-motion/client";

const ClientDetailModal = ({ client, isOpen, onClose }) => {
  if (!client) return null;

  const fadeIn = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };


  const Field = ({ label, value, icon, isLink = false }) => (
    <div className="mb-3">
      <div className="text-sm text-gray-500 flex items-center gap-1">
        {icon && <span>{icon}</span>} {label}
      </div>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-base font-medium"
        >
          {value}
        </a>
      ) : (
        <div className="text-base font-medium text-gray-800">{value}</div>
      )}
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-1">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {children}
      </div>
    </div>
  );

  const ReminderBadge = ({ label, enabled, delay }) => (
    <div className="flex items-center gap-3 text-sm text-gray-700">
      <span className="font-medium w-32">{label}</span>
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {enabled ? "✅ Activé" : "❌ Désactivé"}
      </span>
      {enabled && delay?.m !== undefined && (
        <span className="text-gray-500">({delay.m} min)</span>
      )}
    </div>
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 overflow-y-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🧾 Détails du client
            </Dialog.Title>
            <button onClick={onClose}>
              <XCircle className="text-gray-500 hover:text-gray-700 w-7 h-7" />
            </button>
          </div>

          <Section title="Informations générales">
            <Field icon="🏢" label="Entreprise" value={client.company_name} />
            <Field icon="🆔" label="Code client" value={client.client_code} />
            <Field icon="💼" label="Secteur" value={client.industry} />
            <Field icon="🌐" label="Site web" value={client.website} isLink />
            <Field
              icon="📍"
              label="Adresse"
              value={`${client.address}, ${client.postal_code} ${client.city}, ${client.country}`}
            />
          </Section>

          <Section title="Contact">
            <Field icon="📞" label="Téléphone" value={client.phone} />
            <Field icon="✉️" label="Email" value={client.email} />
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
            />
            <Field
              label="Rappel 1"
              value={formatDate(client.reminder_date_1)}
            />
            <Field
              label="Rappel 2"
              value={formatDate(client.reminder_date_2)}
            />
            <Field
              label="Rappel 3"
              value={formatDate(client.reminder_date_3)}
            />
            <Field
              label="Rappel final"
              value={formatDate(client.reminder_date_final)}
            />
          </Section>

          <Section title="Autres">
            <Field
              icon="🗒️"
              label="Notes"
              value={client.notes || "Aucune note"}
            />
            <Field
              icon="📅"
              label="Créé le"
              value={formatDate(client.created_at)}
            />
            <Field
              icon="🛠️"
              label="Modifié le"
              value={formatDate(client.updated_at)}
            />
          </Section>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default ClientDetailModal;
