import {
  X,
  CheckCircle,
  Loader2,
  MailCheck,
  User2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface ContactModalProps {
  onClose?: () => void;
  defaultSubject?: string;
}

const ContactModal = ({ onClose, defaultSubject }: ContactModalProps) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: defaultSubject || "",
    message: "",
    privacy: false,
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      const response = await fetch("https://formspree.io/f/mqapyeby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactFormData.name,
          email: contactFormData.email,
          subject: contactFormData.subject,
          message: contactFormData.message,
          _gotcha: "",
        }),
      });

      if (response.ok) {
        setContactSubmitted(true);
        setContactFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          privacy: false,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de l'envoi");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setContactError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4">
  {/* Sur mobile, ajoute une marge en haut pour éviter le header sticky */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 max-h-[95vh] overflow-y-auto mt-6">
        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Titre */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <MailCheck className="w-6 h-6 text-blue-600" />
            Contactez-nous
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Nous vous répondrons sous 24h ouvrées.
          </p>
        </div>

        {/* Succès */}
        {contactSubmitted ? (
          <div className="text-center space-y-6 py-10">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-lg font-medium text-green-700">
              Votre message a été envoyé avec succès !
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setContactSubmitted(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Envoyer un autre
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-5">
            {contactError && (
              <div className="flex items-center gap-2 bg-red-100 text-red-700 p-3 rounded-md text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{contactError}</span>
              </div>
            )}

            {/* Nom */}
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <User2 className="w-4 h-4" /> Nom complet
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                required
                value={contactFormData.name}
                onChange={(e) =>
                  setContactFormData({
                    ...contactFormData,
                    name: e.target.value,
                  })
                }
                className="mt-1 w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <MailCheck className="w-4 h-4" /> Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                required
                value={contactFormData.email}
                onChange={(e) =>
                  setContactFormData({
                    ...contactFormData,
                    email: e.target.value,
                  })
                }
                className="mt-1 w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sujet */}
            <div>
              <label
                htmlFor="subject"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <FileText className="w-4 h-4" /> Sujet
              </label>
              <select
                id="subject"
                value={contactFormData.subject}
                onChange={(e) =>
                  setContactFormData({
                    ...contactFormData,
                    subject: e.target.value,
                  })
                }
                required
                className="mt-1 w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choisissez un sujet</option>
                <option value="demo">Demande de démo</option>
                <option value="pricing">Infos tarifaires</option>
                <option value="support">Support</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Votre message..."
                required
                value={contactFormData.message}
                onChange={(e) =>
                  setContactFormData({
                    ...contactFormData,
                    message: e.target.value,
                  })
                }
                className="mt-1 w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* Politique */}
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <input
                id="privacy"
                type="checkbox"
                checked={contactFormData.privacy}
                onChange={(e) =>
                  setContactFormData({
                    ...contactFormData,
                    privacy: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                required
              />
              <label htmlFor="privacy">
                J'accepte la{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowPrivacyPolicy(true)}
                >
                  politique de confidentialité
                </button>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={contactSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {contactSubmitting && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              Envoyer le message
            </button>
          </form>
        )}

        {/* Modal Politique */}
        {showPrivacyPolicy && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Politique de confidentialité
              </h2>
              <div className="text-sm text-gray-600 space-y-3" style={{ whiteSpace: 'pre-line' }}>
  <strong>1. Responsable du traitement</strong>
  <p>
    La société Payment Flow, immatriculée sous le numéro [SIRET à compléter], dont le siège social est situé à [adresse à compléter], est responsable du traitement des données personnelles collectées via ce formulaire de contact.
  </p>
  <strong>2. Données collectées</strong>
  <p>
    Lorsque vous utilisez notre formulaire de contact, nous collectons les données suivantes : <br />
    - Nom et prénom<br />
    - Adresse e-mail<br />
    - Numéro de téléphone (si fourni)<br />
    - Nom de votre entreprise (le cas échéant)<br />
    - Contenu du message
  </p>
  <strong>3. Finalité du traitement</strong>
  <p>
    Les données personnelles collectées via ce formulaire sont utilisées uniquement pour :
    <br />- Répondre à vos demandes ou questions
    <br />- Vous recontacter si nécessaire
    <br />- Vous proposer une démonstration ou un rendez-vous, si cela est mentionné dans votre message
  </p>
  <strong>4. Base légale du traitement</strong>
  <p>
    Le traitement de vos données repose sur votre consentement explicite, exprimé lorsque vous soumettez le formulaire.
  </p>
  <strong>5. Durée de conservation</strong>
  <p>
    Vos données sont conservées pendant 12 mois à compter de la dernière interaction, sauf demande de suppression de votre part avant ce délai.
  </p>
  <strong>6. Destinataires des données</strong>
  <p>
    Vos données personnelles sont uniquement accessibles par :
    <br />- L’équipe interne de Payment Flow
    <br />- Nos prestataires techniques (hébergement, CRM), soumis à des clauses de confidentialité strictes
    <br />Aucune donnée n’est transférée ou vendue à des tiers à des fins commerciales.
  </p>
  <strong>7. Hébergement des données</strong>
  <p>
    Les données sont hébergées au sein de l’Union Européenne, via nos partenaires techniques conformes au RGPD.
  </p>
  <strong>8. Vos droits</strong>
  <ul className="list-disc ml-5">
    <li>Droit d’accès à vos données</li>
    <li>Droit de rectification</li>
    <li>Droit à l’effacement (droit à l’oubli)</li>
    <li>Droit à la limitation du traitement</li>
    <li>Droit d’opposition</li>
    <li>Droit à la portabilité</li>
  </ul>
  <p>
    Pour exercer vos droits, contactez-nous à l’adresse : <a href="mailto:contact@paymentflow.fr" className="text-blue-600 underline">contact@paymentflow.fr</a>.
  </p>
  <strong>9. Réclamations</strong>
  <p>
    Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (Commission Nationale de l’Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.cnil.fr</a>.
  </p>
  <strong>10. Modification de la politique</strong>
  <p>
    Payment Flow se réserve le droit de modifier la présente Politique de Confidentialité. Toute modification importante vous sera notifiée via le site.
  </p>
</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
