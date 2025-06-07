import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAbonnement } from "../context/AbonnementContext";

const DeleteAccount = () => {
  const { checkAbonnement } = useAbonnement();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [mfaRequired, setMfaRequired] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");

  const [user, setUser] = useState<any>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Chargement initial : utilisateur + état MFA
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      if (factorsData?.totp?.length) {
        setMfaEnabled(true);
        setFactorId(factorsData.totp[0].id);
      }
    };

    fetchUserData();
  }, []);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAbonnement()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (mfaEnabled && !mfaRequired) {
        // Étape 1 : on demande le code OTP
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId,
        });

        if (challengeError) throw new Error("Erreur MFA : " + challengeError.message);

        setChallengeId(challenge.id);
        setMfaRequired(true);
        setLoading(false);
        return; // on attend le code OTP
      }

      if (mfaEnabled && mfaRequired) {
        // Étape 2 : vérification OTP
        const { error: mfaError } = await supabase.auth.mfa.verify({
          factorId,
          challengeId,
          code: mfaCode,
        });

        if (mfaError) throw new Error("Code MFA incorrect.");
      }

      if (!mfaEnabled) {
        // Auth via mot de passe
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: user?.email,
          password,
        });

        if (loginError) throw new Error("Mot de passe incorrect.");
      }

      // Récupérer le token
      const { data: sessionData } = await supabase.auth.getSession();
      const access_token = sessionData?.session?.access_token;
      if (!access_token) throw new Error("Utilisateur non authentifié.");

      // Appel API pour suppression côté back
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clever-service`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({ user_id: user?.id }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur lors de la suppression du compte.");

      await supabase.auth.signOut();
      navigate("/account-deleted");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Supprimer votre compte</h2>
      <p className="mb-2">
        Cette action est irréversible. Veuillez confirmer votre identité.
      </p>

      <form onSubmit={handleDelete}>
        {!mfaEnabled && (
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        )}

        {mfaEnabled && mfaRequired && (
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              Code de vérification MFA
            </label>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123 456"
              className="w-full border p-2"
              required
            />
          </div>
        )}

        {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-red-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
        >
          {loading ? "Suppression en cours..." : "Supprimer mon compte"}
        </button>
      </form>
    </div>
  );
};

export default DeleteAccount;
