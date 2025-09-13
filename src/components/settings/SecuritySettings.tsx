import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { AlertCircle, Save, Lock } from "lucide-react";
import { useAbonnement } from "../context/AbonnementContext";
import SecretKeyDisplay from "./SecretKeyDisplay";
export function SecuritySettings() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres de sécurité</h1>
      <MfaSettings />
      <hr />
      <PasswordSettings />
    </div>
  );
}
// Définition locale du type Factor incluant totp
export type Factor = {
  id: string;
  factor_type: string;
  status: string;
  totp?: {
    qr_code?: string;
    secret?: string;
  };
};

export function MfaSettings() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchFactors = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
  
      if (error) {
        console.error("Erreur récupération MFA:", error);
        return;
      }
  
      const totpFactor = (data?.all?.find((f) => f.factor_type === "totp") as Factor | undefined);
  
      if (totpFactor) {
        setFactorId(totpFactor.id);
        setQrCodeUrl(totpFactor.totp?.qr_code || null);
        setSecretKey(totpFactor.totp?.secret ||null)
        setSuccess(totpFactor.status === "verified");
      }
    };
  
    fetchFactors();
  }, []);
  
  const generate = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "PaymentFlow",
      friendlyName: "Payment-flow totp",
    });
  
    if (error) {
      setError(error.message);
      return;
    }
  
    setFactorId(data.id);
    setQrCodeUrl(data.totp.qr_code);
    setSecretKey(data.totp.secret); // 🔑 ici
    setError(null);
  };
  

  const verify = async () => {
    if (!factorId) {
      setError("Le factorId est manquant");
      return;
    }

    // Étape 1 : générer un challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setError(challengeError.message);
      return;
    }

    const challengeId = challengeData.id;

    // Étape 2 : vérifier le code TOTP
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setSuccess(true);
    setError(null);
  };

  const removeMfa = async () => {
    if (!factorId) {
      setError("Aucun facteur d'authentification à supprimer.");
      return;
    }
  
    // Étape 1 : Créer un challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  
    if (challengeError) {
      setError(challengeError.message);
      return;
    }
  
    const challengeId = challengeData.id;
    if (!code || code.trim() === "") {
      setError("Veuillez entrer le code TOTP avant de désactiver le MFA.");
      return;
    }
    
    // Étape 2 : Vérifier le code (re-saisir le code TOTP de l'utilisateur)
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code, // le code TOTP que l'utilisateur a saisi
    });
  
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
  
    // Étape 3 : Maintenant que l’utilisateur est "AAL2", on peut désactiver le MFA
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
  
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }
  
    // Réinitialisation des états
    setSuccess(false);
    setQrCodeUrl(null);
    setFactorId(null);
    setCode("");
    setError(null);
  };
  

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Activer la double authentification</h2>

      {!qrCodeUrl && !success && (
        <button
          onClick={generate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Générer le QR Code
        </button>
      )}

{qrCodeUrl && !success && (
  <div>
    <p>Scanne ce QR code avec une application comme Google Authenticator :</p>
    <img src={qrCodeUrl} className="my-4" alt="QR Code MFA" />
    {secretKey && <SecretKeyDisplay secretKey={secretKey} />}


    <input
      type="text"
      placeholder="Code à 6 chiffres"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="border p-2 mt-2 block w-full"
    />
    <button
      onClick={verify}
      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Valider le code
    </button>
  </div>
)}

{success && (
  <div className="space-y-2">
    <p className="text-green-600">MFA activée avec succès !</p>

    <input
      type="text"
      placeholder="Code à 6 chiffres"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="border p-2 mt-2 block w-full"
    />
    <button
      onClick={removeMfa}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Supprimer la double authentification
    </button>
  </div>
)}


      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}



export  function PasswordSettings() {
  const { checkAbonnement } = useAbonnement();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const handleClick = () => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
    return true;
  };
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  const showSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };
  // Gestion de la touche Echap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Si la modale est ouverte, la fermer
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          modal.dispatchEvent(new Event("close"));
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allowed = handleClick();
    if (!allowed) return;
    if (formData.newPassword !== formData.confirmPassword) {
      showError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      showSuccess();
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      showError("Impossible de changer le mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Sécurité</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Mot de passe changé avec succès
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe actuel
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? "Enregistrement..." : "Changer le mot de passe"}
          </button>
        </div>
      </form>
    </div>
  );
}
