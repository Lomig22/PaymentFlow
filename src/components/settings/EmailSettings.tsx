import React, { useState, useEffect, useRef } from "react";
import { differenceInDays } from "date-fns";
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
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useAbonnement } from "../context/AbonnementContext";

const PROVIDER_PRESETS = {
  platform: {
    // Utilise l'expéditeur par défaut PaymentFlow côté Edge (secrets)
    smtp_server: "",
    smtp_port: 587,
    smtp_encryption: "tls",
  },
  infomaniak: {
    smtp_server: "mail.infomaniak.com",
    smtp_port: 587,
    smtp_encryption: "tls",
  },
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
  provider_type: "platform",
  smtp_username: "",
  smtp_password: "",
  smtp_server: "",
  smtp_port: 587,
  smtp_encryption: "tls",
  email_signature: "",
  sender_display_name: "",
};

export default function EmailSettings({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { checkAbonnement } = useAbonnement();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialRef = useRef<typeof DEFAULT_FORM_DATA | null>(null);
  const location = useLocation();
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
        setUserEmail(user.email ?? null);
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
  const [isTrial, setIsTrial] = useState(false);

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
        // Détecte l'essai gratuit (30 jours à partir de la création du compte)
        let trial = false;
        try {
          if (user.created_at) {
            const createdAt = new Date(user.created_at);
            trial = differenceInDays(new Date(), createdAt) < 30;
          }
        } catch {}
        setIsTrial(trial);

        const subscription = await fetchSubscription(supabase, user.id);
        const plan = subscription?.[0]?.plan;
        if (plan === "free" || plan === "basic") {
          // En essai gratuit, on n'applique pas le blocage UI
          setIsDisabled(!trial);
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
        // Détecte les anciens placeholders pour forcer le mode plateforme à l'affichage
        const placeholderLike =
          data.smtp_username === 'no-reply@payment-flow.fr' ||
          data.smtp_password === 'donthavetosaveit' ||
          data.smtp_server === 'my.smtpserver.com';

        // Cas où la base a enregistré 'custom' mais sans identifiants ni serveur => afficher comme 'platform'
        const savedAsCustomLooksPlatform =
          (data.provider_type === 'custom') &&
          (!data.smtp_username) && (!data.smtp_password) && (!data.smtp_server);

        const provider_type = data.provider_type || "platform";

        // Détection heuristique des presets courants si la base a 'custom'
        const server = String(data.smtp_server || '').toLowerCase();
        const port = Number(data.smtp_port) || 0;
        const enc  = String(data.smtp_encryption || '').toLowerCase();
        const looksInfomaniak = server === 'mail.infomaniak.com' && port === 587 && enc === 'tls';
        const looksOVH = server === 'ssl0.ovh.net' && port === 587 && enc === 'tls';
        const looksGmail = server === 'smtp.gmail.com' && port === 587 && enc === 'tls';

        let effectiveProvider = (placeholderLike || savedAsCustomLooksPlatform)
          ? 'platform'
          : provider_type;

        if (provider_type === 'custom' && !savedAsCustomLooksPlatform) {
          if (looksInfomaniak) effectiveProvider = 'infomaniak';
          else if (looksOVH) effectiveProvider = 'ovh';
          else if (looksGmail) effectiveProvider = 'gmail';
        }

        const newForm = {
          provider_type: effectiveProvider,
          smtp_username: (placeholderLike || savedAsCustomLooksPlatform) ? "" : (data.smtp_username || ""),
          smtp_password: (placeholderLike || savedAsCustomLooksPlatform) ? "" : (data.smtp_password || ""),
          smtp_server: (placeholderLike || savedAsCustomLooksPlatform) ? "" : (data.smtp_server || ""),
          smtp_port: data.smtp_port || 587,
          smtp_encryption: (data.smtp_encryption || "tls").toLowerCase(),
          email_signature: data.email_signature || "",
          sender_display_name: data.sender_display_name || "",
        } as typeof DEFAULT_FORM_DATA;
        setFormData(newForm);
        initialRef.current = newForm;
        setHasUnsavedChanges(false);
      } else {
        // Aucun enregistrement: on initialise le snapshot au formulaire par défaut
        const newForm = { ...DEFAULT_FORM_DATA } as typeof DEFAULT_FORM_DATA;
        setFormData(newForm);
        initialRef.current = newForm;
        setHasUnsavedChanges(false);
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
      // En mode plateforme, on n'utilise pas les identifiants saisis
      smtp_username: provider === 'platform' ? '' : prev.smtp_username,
      smtp_password: provider === 'platform' ? '' : prev.smtp_password,
    }));
  };
  const handleRestoreDefaults = () => {
    // Revient à un état "propre" qui force l'utilisateur à saisir des informations réelles
    setFormData({
      provider_type: "custom",
      smtp_username: "",
      smtp_password: "",
      smtp_server: "",
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
      // 1) Tente de persister le provider sélectionné (sera accepté une fois la contrainte mise à jour)
      let { error } = await supabase.from("email_settings").upsert(
        {
          user_id: userId,
          ...formData,
          provider_type: formData.provider_type,
          sender_display_name: formData.sender_display_name,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      // 2) Si la contrainte actuelle refuse (23514), fallback en 'custom' pour ne pas bloquer l'utilisateur
      if (error && (error as any).code === '23514') {
        console.warn('provider_type refusé par la contrainte, fallback -> custom');
        const retry = await supabase.from("email_settings").upsert(
          {
            user_id: userId,
            ...formData,
            provider_type: 'custom',
            sender_display_name: formData.sender_display_name,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        if (retry.error) throw retry.error;
        // Info UX
        showError("Votre base n'accepte pas encore ce fournisseur. Sauvegarde effectuée comme 'Personnalisé'.");
      } else if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      // Recharger les paramètres pour confirmer la mise à jour
      await loadEmailSettings(userId);
      // Snapshot mis à jour via loadEmailSettings
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      showError("Impossible de sauvegarder les paramètres");
    } finally {
      setSaving(false);
    }
  };
  const navigate = useNavigate();
  
  // Met à jour automatiquement l'état dirty quand formData change
  useEffect(() => {
    if (!initialRef.current) return;
    try {
      setHasUnsavedChanges(
        JSON.stringify(initialRef.current) !== JSON.stringify(formData)
      );
    } catch {}
  }, [formData]);

  // Informe le parent (Settings) de l'état dirty
  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  // Expose l’état dirty au niveau global (Layout) via sessionStorage
  useEffect(() => {
    try {
      if (hasUnsavedChanges) sessionStorage.setItem('unsaved:settings', '1');
      else sessionStorage.removeItem('unsaved:settings');
    } catch {}
  }, [hasUnsavedChanges]);

  // Avertissement natif si on quitte l’onglet ou recharge avec des modifications non enregistrées
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercepte les clics sur les liens internes pour demander confirmation si nécessaire
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (
        anchor &&
        anchor instanceof HTMLAnchorElement &&
        anchor.href &&
        anchor.origin === window.location.origin &&
        anchor.pathname !== location.pathname &&
        !anchor.href.startsWith("mailto:") &&
        !anchor.href.startsWith("tel:")
      ) {
        if (hasUnsavedChanges) {
          e.preventDefault();
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
            if (result.isConfirmed) {
              const a = anchor as HTMLAnchorElement;
              navigate(a.pathname + a.search + a.hash);
            }
          });
        }
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasUnsavedChanges, location.pathname, navigate]);

  const sendToSignatureSetting = () => {
    const doNav = () => navigate("/settings", { state: { initialSectionId: "reminders", initialSubTabId: "sender" } });
    if (!hasUnsavedChanges) {
      doNav();
      return;
    }
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
      if (result.isConfirmed) doNav();
    });
  };
  const handleTestEmail = async () => {
    // Si on est en mode 'platform' (par défaut PaymentFlow), on n'exige pas de credentials côté UI
    const isPlatform = formData.provider_type === 'platform';
    if (!isPlatform) {
      if (!formData.smtp_username) {
        showError("Veuillez renseigner l'adresse email d'envoi.");
        return;
      }
      if (!formData.smtp_password || formData.smtp_password === "donthavetosaveit") {
        showError("Veuillez saisir le mot de passe SMTP réel (ou mot de passe d'application).");
        return;
      }
      if (!formData.smtp_server || formData.smtp_server === "my.smtpserver.com") {
        showError("Veuillez renseigner le serveur SMTP réel (ex: smtp.gmail.com, ssl0.ovh.net).");
        return;
      }
    }

    setTesting(true);
    setError(null);
    setTestSuccess(false);

    try {
      await sendEmail(
        formData,
        // Envoi au profil utilisateur si mode plateforme, sinon à l'adresse renseignée
        (formData.provider_type === 'platform' ? (userEmail || formData.smtp_username) : formData.smtp_username),
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
  const isPlatformSelected = formData.provider_type === "platform";

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
            <option value="platform">Par défaut</option>
            <option value="infomaniak">Infomaniak</option>
            <option value="gmail">Gmail</option>
            <option value="ovh">OVH</option>
            <option value="custom">Personnalisé</option>
          </select>
          {isPlatformSelected && (
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              Les envois utiliseront l'adresse no-reply@payment-flow.fr (Infomaniak). Aucun identifiant n'est requis.
            </p>
          )}
        </div>

        {formData.provider_type !== "platform" && (
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
        )}
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

        {formData.provider_type !== "platform" && (
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
        )}

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
              testing || (!isPlatformSelected && (!formData.smtp_username || !formData.smtp_password))
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
