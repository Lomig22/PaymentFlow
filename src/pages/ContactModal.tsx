import { X, CheckCircle } from "lucide-react";
import { useState } from "react";

interface ContactModalProps {
  onClose?: () => void;
  defaultSubject?:string;
}

const ContactModal = ({ onClose,defaultSubject }: ContactModalProps) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: defaultSubject||"",
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
        headers: {
          "Content-Type": "application/json",
        },
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
        throw new Error(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setContactError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
<div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-lg shadow-xl p-6 max-w-xl w-full max-h-[95vh] overflow-y-auto relative">
    
    {/* Bouton de fermeture */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-500 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full p-1"
      aria-label="Fermer le formulaire"
    >
      <X className="h-6 w-6" />
    </button>

    {/* Titre */}
    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
      📩 Contactez notre équipe
    </h1>

    {/* Message succès */}
    {contactSubmitted ? (
      <div className="text-center py-10">
        <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg mb-6 flex items-center justify-center shadow-sm">
          <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
          <span>Votre message a été envoyé avec succès !</span>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setContactSubmitted(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            ✉️ Nouveau message
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            ❌ Fermer
          </button>
        </div>
      </div>
    ) : (
      <form onSubmit={handleContactSubmit} className="space-y-6">

        {/* Erreur */}
        {contactError && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-sm">
            {contactError}
          </div>
        )}

        {/* Champs */}
        {[
          {
            id: "name",
            label: "Nom complet",
            type: "text",
            placeholder: "Votre nom",
            value: contactFormData.name,
            onChange: (e: any) => setContactFormData({ ...contactFormData, name: e.target.value })
          },
          {
            id: "email",
            label: "Email",
            type: "email",
            placeholder: "votre@email.com",
            value: contactFormData.email,
            onChange: (e: any) => setContactFormData({ ...contactFormData, email: e.target.value })
          }
        ].map(({ id, label, type, placeholder, value, onChange }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <input
              id={id}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition hover:shadow-sm"
              required
            />
          </div>
        ))}

        {/* Sujet */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">Sujet</label>
          <select
            id="subject"
            value={contactFormData.subject}
            onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          >
            <option value="">Sélectionnez un sujet</option>
            <option value="demo">Demande de démonstration</option>
            <option value="pricing">Informations tarifaires</option>
            <option value="support">Support technique</option>
            <option value="partnership">Partenariat</option>
            <option value="other">Autre</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
          <textarea
            id="message"
            rows={4}
            value={contactFormData.message}
            onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
            placeholder="Comment pouvons-nous vous aider ?"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition hover:shadow-sm"
            required
          ></textarea>
        </div>

        {/* Champ anti-bot */}
        <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} />

        {/* Politique de confidentialité */}
        <div className="flex items-start gap-2">
          <input
            id="privacy"
            type="checkbox"
            checked={contactFormData.privacy}
            onChange={(e) => setContactFormData({ ...contactFormData, privacy: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="privacy" className="text-sm text-gray-500">
            J'accepte la{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPrivacyPolicy(true);
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              politique de confidentialité
            </button>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={contactSubmitting}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {contactSubmitting ? "Envoi en cours..." : "📨 Envoyer"}
        </button>
      </form>
    )}

    {/* Modal de politique */}
    {showPrivacyPolicy && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={() => setShowPrivacyPolicy(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Politique de confidentialité
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            [Insérez ici le contenu de la politique...]
          </p>
        </div>
      </div>
    )}
  </div>
</div>

  );
};

export default ContactModal;
