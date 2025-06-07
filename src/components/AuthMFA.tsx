import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  onMFASuccess: () => void;
};

export default function AuthMFA({ onMFASuccess }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setError("");
    setLoading(true);
    try {
      const { data: factorsData, error: listError } =
        await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

    //  const totpFactor = factorsData.totp[0];
      const totpFactor = factorsData.totp.find(
        (f) => f.status === "verified"
      );
      if (!totpFactor)
        throw new Error("Aucun facteur TOTP non vérifié trouvé.");

      if (!totpFactor) throw new Error("Aucun facteur TOTP trouvé.");

      const factorId = totpFactor.id;
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const challengeId = challengeData.id;

      console.log("✅ TOTP factor ID:", factorId);
      console.log("✅ Challenge ID:", challengeId);
      console.log("🔢 Code saisi:", code);

      // Fallback timeout de 7s si Supabase ne répond pas
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });
      
      if (verifyError) {
        throw verifyError.message;
      }
      
      /* console.log("✅ MFA Verification succeeded:", verifyData);
      onMFASuccess(); */
    } catch (err: any) {
      console.error("❌ Erreur MFA:", err);
      setError(err || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold text-center">
          Validation à deux facteurs
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Entrez le code généré par votre application d’authentification (TOTP).
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code à 6 chiffres"
          className="border border-gray-300 rounded px-4 py-2 w-full text-center font-mono text-lg"
          maxLength={6}
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          onClick={verify}
          disabled={loading || code.length !== 6}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {loading ? "Vérification..." : "Valider"}
        </button>
      </div>
    </div>
  );
}
