import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  AlertCircle,
  Save,
  HelpCircle,
  Send,
  RefreshCw,
  PencilIcon,
} from "lucide-react";
import { sendEmail } from "../../lib/email";
import { useNavigate } from "react-router-dom";
import { useAbonnement } from "../context/AbonnementContext";

const PROVIDER_PRESETS = {
  ovh: {
    smtp_server: "ssl0.ovh.net",
    smtp_port: 587,
    smtp_encryption: "tls",
  },
  gmail: {
    smtp_server: "smtp.gmail.com",
    smtp_port: 587,
    smtp_encryption: "tls",
  },
  custom: {
    smtp_server: "",
    smtp_port: 587,
    smtp_encryption: "tls",
  },
};

const DEFAULT_FORM_DATA = {
  provider_type: "reset_defaults",
  smtp_username: "no-reply@payment-flow.fr",
  smtp_password: "donthavetosaveit",
  smtp_server: "my.smtpserver.com",
  smtp_port: 587,
  smtp_encryption: "tls",
  email_signature: "",
  sender_display_name: "",
};

export default function EmailSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [userId, setUserId] = useState<string | null>(null);
  const { checkAbonnement } = useAbonnement();
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  const handleClick = () => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
    return true;
  };
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non authentifié");
        setUserId(user.id);
        await loadEmailSettings(user.id);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        showError("Impossible de charger les paramètres email");
      } finally {
        setLoading(false);
      }
    };

    initializeSettings();
  }, []);
    useEffect(() => {
      const navigateInfo = localStorage.getItem("navigateAfterPayment");
      if (navigateInfo) {
        const { pathname, state } = JSON.parse(navigateInfo);
        navigate(pathname, { state });
        localStorage.removeItem("navigateAfterPayment");
      }
    }, []);
  async function fetchSubscription(supabase: any, userId: any) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Erreur abonnement :", error.message);
      return null;
    }
    return data;
  }
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const checkUserAndSubscription = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Erreur d’authentification:", authError);
        return;
      }

      if (user?.id) {
        const subscription = await fetchSubscription(supabase, user.id);
        if (
          subscription[0]?.plan === "free" ||
          subscription[0]?.plan === "basic"
        ) {
          setIsDisabled(true);
        }
      }
    };

    checkUserAndSubscription();
  }, [supabase]);
  const loadEmailSettings = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          provider_type: data.provider_type || "custom",
          smtp_username: data.smtp_username || "noreply@payment-flow.fr",
          smtp_password: data.smtp_password || "donthavetosaveit",
          smtp_server: data.smtp_server || "my.smtpserver.com",
          smtp_port: data.smtp_port || 587,
          smtp_encryption: data.smtp_encryption || "TLS",
          email_signature: data.email_signature || "",
          sender_display_name: data.sender_display_name || "",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
      throw error;
    }
  };

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider as keyof typeof PROVIDER_PRESETS];
    setFormData((prev) => ({
      ...prev,
      provider_type: provider,
      smtp_server: preset.smtp_server,
      smtp_port: preset.smtp_port,
      smtp_encryption: preset.smtp_encryption,
    }));
  };
  const handleRestoreDefaults = () => {
    setFormData({
      provider_type: "reset_defaults",
      smtp_username: "no-reply@payment-flow.fr",
      smtp_password: "donthavetosaveit",
      smtp_server: "my.smtpserver.com",
      smtp_port: 587,
      smtp_encryption: "tls",
      email_signature: formData.email_signature || "",
      sender_display_name: formData.sender_display_name || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allowed = handleClick();
    if (!allowed) return;
    if (!userId) {
      showError("Utilisateur non authentifié");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.from("email_settings").upsert(
        {
          user_id: userId,
          ...formData,
          sender_display_name: formData.sender_display_name,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      // Recharger les paramètres pour confirmer la mise à jour
      await loadEmailSettings(userId);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      showError("Impossible de sauvegarder les paramètres");
    } finally {
      setSaving(false);
    }
  };
  const navigate = useNavigate();

  const sendToSignatureSetting = () => {
    // alert("send")
    navigate("/settings", {
      state: { initialSectionId: "reminders", initialSubTabId: "sender" },
    });
  };
  const handleTestEmail = async () => {
    if (!formData.smtp_username || !formData.smtp_password) {
      showError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setTesting(true);
    setError(null);
    setTestSuccess(false);

    try {
      await sendEmail(
        formData,
        formData.smtp_username,
        "Test de configuration email PaymentFlow",
        `
          <h1>Test de configuration email</h1>
          <p>Si vous recevez cet email, votre configuration SMTP est correcte !</p>
          <p>Paramètres utilisés :</p>
          <ul>
            <li>Serveur SMTP : ${formData.smtp_server}</li>
            <li>Port : ${formData.smtp_port}</li>
            <li>Chiffrement : ${formData.smtp_encryption}</li>
          </ul>
        `
      );

      setTestSuccess(true);
      // Masquer le message après 3 secondes
      setTimeout(() => {
        setTestSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Erreur lors du test d'envoi:", error);
      showError(
        error.message ||
          "Impossible d'envoyer l'email de test. Vérifiez vos paramètres."
      );
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isDisabled && (
        <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm flex justify-between items-center">
          <span>Votre plan actuel ne permet pas cette modification.</span>
          <a
            href="/pricing"
            className="text-yellow-600 font-medium hover:underline"
          >
            Passer à un plan supérieur
          </a>
        </div>
      )}

      <h2 className="text-xl font-bold mb-6">Paramètres email</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 z-50 max-w-4xl w-full">
          Paramètres sauvegardés avec succès
        </div>
      )}

      {testSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 z-50 max-w-4xl w-full">
          Email de test envoyé avec succès ! Vérifiez votre boîte de réception.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fournisseur SMTP
          </label>
          <select
            disabled={isDisabled}
            value={formData.provider_type || "reset_defaults"}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "reset_defaults") {
                handleRestoreDefaults();
                return; // ne change pas la valeur du formulaire
              }
              handleProviderChange(value);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="reset_defaults">Par défaut</option>
            <option value="gmail">Gmail</option>
            <option value="ovh">OVH</option>
            <option value="custom">Personnalisé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email
          </label>
          <input
            disabled={isDisabled}
            type="email"
            required
            value={formData.smtp_username}
            onChange={(e) =>
              setFormData({ ...formData, smtp_username: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formData.provider_type === "gmail" && (
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              Utilisez votre adresse Gmail
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom d'expéditeur affiché
            <span className="ml-1 text-xs text-gray-400">(visible par vos destinataires)</span>
          </label>
          <input
            disabled={isDisabled}
            type="text"
            placeholder="Ex: Société Dupont, Alice Dupont, ..."
            value={formData.sender_display_name}
            onChange={(e) => setFormData({ ...formData, sender_display_name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            disabled={isDisabled}
            type="password"
            required
            value={formData.smtp_password}
            onChange={(e) =>
              setFormData({ ...formData, smtp_password: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formData.provider_type === "gmail" && (
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              Utilisez un mot de passe d'application généré dans les paramètres
              de sécurité Google
            </p>
          )}
        </div>

        {(formData.provider_type === "custom" ||
          formData.provider_type === "reset_defaults") && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serveur SMTP
              </label>
              <input
                disabled={isDisabled}
                type="text"
                required
                value={formData.smtp_server}
                onChange={(e) =>
                  setFormData({ ...formData, smtp_server: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port SMTP
              </label>
              <input
                disabled={isDisabled}
                type="number"
                required
                value={formData.smtp_port}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    smtp_port: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chiffrement SMTP
              </label>
              <select
                disabled={isDisabled}
                value={formData.smtp_encryption}
                onChange={(e) =>
                  setFormData({ ...formData, smtp_encryption: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">Aucun</option>
              </select>
            </div>
          </>
        )}
        <div className="mb-4">
          <label
            htmlFor="signature"
            className="block text-sm font-medium text-gray-700"
          >
            Signature (HTML)
          </label>
        </div>

        <div className="mt-4 w-[30vw]">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Aperçu de la signature :
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const allowed = handleClick();
                if (!allowed) return;
                sendToSignatureSetting();
              }}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Personnaliser la signature"
              type="button"
            >
              <PencilIcon className="h-5 w-5 mr-1" aria-hidden="true" />
              Modifier
            </button>
          </div>
          <div
            className="rounded"
            dangerouslySetInnerHTML={{ __html: formData.email_signature }}
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const allowed = handleClick();
              if (!allowed) return;
              handleTestEmail();
            }}
            disabled={
              testing || !formData.smtp_username || !formData.smtp_password
            }
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-green-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            <Send className="h-5 w-5 mr-2" />
            {testing ? "Envoi en cours..." : "Tester l'envoi"}
          </button>

          <button
            type="submit"
            disabled={isDisabled || saving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
