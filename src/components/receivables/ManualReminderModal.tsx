import React, { useState } from "react";
import { X, CheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";

interface ManualReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any; // Should be typed as Client
  onSendReminder: (subject: string, content: string, signature: string) => Promise<boolean>;
  initialSubject?: string;
  initialContent?: string;
  initialSignature?: string;
  loading?: boolean;
}

const ManualReminderModal: React.FC<ManualReminderModalProps> = ({
  isOpen,
  onClose,
  client,
  onSendReminder,
  initialSubject = "",
  initialContent = "",
  initialSignature = "",
  loading = false,
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [signature, setSignature] = useState(initialSignature);
  const [sendError, setSendError] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSendError(false);
    setSendSuccess(false);
    setSending(true);
    const result = await onSendReminder(subject, content, signature);
    setSending(false);
    if (result) {
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 2000);
    } else {
      setSendError(true);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 overflow-y-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              Relancer {client?.company_name ? `: ${client.company_name}` : ""}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-red-600">
              <X className="w-7 h-7" />
            </button>
          </div>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSend(); }}>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Objet
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Entrez l'objet"
                disabled={sending || loading}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Entrez votre message"
                disabled={sending || loading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
                Signature (HTML)
              </label>
              <textarea
                id="signature"
                name="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Entrez votre signature HTML"
                disabled={sending || loading}
              ></textarea>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aperçu de la signature :
              </label>
              <div
                className="border p-4 rounded bg-white shadow"
                dangerouslySetInnerHTML={{ __html: signature }}
              />
            </div>
            {sendError && (
              <div className="mt-4 text-red-600 text-sm font-medium">
                Une erreur est survenue lors de l'envoi de la relance. Veuillez réessayer.
              </div>
            )}
            {sendSuccess && (
              <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                <CheckIcon className="h-5 w-5 mr-2" /> Relance envoyée avec succès !
              </div>
            )}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                disabled={sending || loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={sending || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {sending || loading ? "Envoi..." : "Envoyer la relance"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default ManualReminderModal;
