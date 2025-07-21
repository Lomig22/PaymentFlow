import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showTotpPrompt, setShowTotpPrompt] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [mfaChallenge, setMfaChallenge] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.name === "MFARequiredError") {
          // Si MFA est requis
          setMfaChallenge(error.message); // message = mfa ticket
          setShowTotpPrompt(true);
          return; // On attend la saisie du code MFA
        }

        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou mot de passe incorrect.");
        }
        throw error;
      }

      if (!data.user) throw new Error("Utilisateur non trouvé");

      // Vérifier l’abonnement
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", data.user.id);

      if (subError) throw new Error("Erreur de vérification de l'abonnement");
      if (!subscriptions || subscriptions.length === 0) {
        await supabase.auth.signOut();
        throw new Error("Vous n'avez pas d'abonnement actif.");
      }

      if (!data.user.email) {
        throw new Error("Email utilisateur introuvable. Veuillez réessayer.");
      }
      navigate(`/dashboard/${encodeURIComponent(data.user.email)}`);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Erreur lors de la connexion",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://lomig.onirtech.com/dashboard/",
        },
      });

      if (error) {
        throw error;
      }

      // L'utilisateur est redirigé automatiquement via l'OAuth callback.
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Une erreur est survenue avec Google",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100/80 backdrop-blur-sm flex items-center justify-center p-4 fixed inset-0 z-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 relative">
        <h2 className="text-2xl font-bold text-center mb-8">Se connecter</h2>

        {message && (
          <div
            className={`p-4 rounded-md mb-6 ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="exemple@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500">ou</span>
          </div>
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 p-3 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continuer avec Google
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Créer un compte
              </Link>
            </p>

            <p className="text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        </form>
        <Link to="/">
          <button className="mt-6 w-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
