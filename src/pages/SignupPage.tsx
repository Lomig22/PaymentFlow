import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_]/.test(password);

  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasSpecialChar,
    errors: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasSpecialChar,
    },
  };
};

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  const validateForm = () => {
    if (!email.trim()) {
      setMessage({ type: "error", text: "Veuillez saisir votre email." });
      return false;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage({ type: "error", text: "Veuillez saisir un email valide." });
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const errors = [];
      if (!passwordValidation.errors.minLength)
        errors.push("8 caractères minimum");
      if (!passwordValidation.errors.hasUpperCase) errors.push("une majuscule");
      if (!passwordValidation.errors.hasLowerCase) errors.push("une minuscule");
      if (!passwordValidation.errors.hasSpecialChar)
        errors.push("un caractère spécial");

      setMessage({
        type: "error",
        text: `Le mot de passe doit contenir : ${errors.join(", ")}`,
      });
      return false;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data?.user?.identities?.length === 0) {
        setMessage({
          type: "error",
          text: "Cette adresse email est déjà utilisée.",
        });
        return;
      }

      if (data?.user) {
        const userId = data.user.id;
        const formatedEmail = email.toLowerCase();
        const { error: upsertError } = await supabase
          .from("pending_profiles")
          .upsert(
            [
              {
                id: userId,
                name,
                phone,
                company,
                email: formatedEmail,
              },
            ],
            {
              onConflict: "id", // clé sur laquelle on veut faire le upsert
            }
          );

        if (upsertError) {
          console.error(
            "Erreur lors du upsert dans profiles:",
            upsertError.message
          );
        } else {
          console.log("Profil mis à jour ou inséré avec succès !");
        }
      }
      setMessage({
        type: "success",
        text: "Un e-mail de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.",
      });

      // Redirect after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Une erreur est survenue lors de la création du compte",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const formatedEmail = email.toLowerCase();
    try {
      // Maintenant, upsert dans la table pending_profiles en utilisant email comme clé de conflit
      const { error: upsertError } = await supabase
        .from("pending_profiles")
        .upsert(
          [
            {
              email: formatedEmail,
              name,
              phone,
              company,
            },
          ],
          {
            onConflict: "email", // On utilise l'email pour gérer les conflits
          }
        );

      if (upsertError) {
        console.error(
          "Erreur lors du upsert dans pending_profiles:",
          upsertError.message
        );
      } else {
        console.log("Profil Google inséré ou mis à jour !");
      }
      await supabase.auth.signInWithOAuth({
        provider: "google",
      });
    } catch (err) {
      console.error("Erreur auth Google", err);
    }
  };
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Créer votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Déjà un compte?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/*multistep auth */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom complet
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md 
            shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
            focus:border-blue-500 sm:text-sm"
                      placeholder="Jean Dupont"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Numéro de téléphone
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md 
            shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
            focus:border-blue-500 sm:text-sm"
                      placeholder="+261 34 00 000 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Entreprise */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom de l'entreprise
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md 
            shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
            focus:border-blue-500 sm:text-sm"
                      placeholder="Onirtech"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Email */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresse email
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full px-10 py-3 border border-gray-300 rounded-md 
                    shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                    focus:border-blue-500 sm:text-sm"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm 
          text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none 
          focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-10 py-3 border border-gray-300 rounded-md 
                    shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                    focus:border-blue-500 sm:text-sm pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMessage(null);
                      setShowPasswordRequirements(true);
                    }}
                    onFocus={() => setShowPasswordRequirements(true)}
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

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmer le mot de passe
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-10 py-3 border border-gray-300 rounded-md 
                    shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                    focus:border-blue-500 sm:text-sm pr-12"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm 
              text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none 
              focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Création en cours..." : "S'inscrire"}
              </button>
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 p-3 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                S'inscrire avec Google
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Retour
              </button>
              <div className="text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              {showPasswordRequirements && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Exigences du mot de passe:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li
                      className={`flex items-center ${
                        password.length >= 8 ? "text-green-600" : ""
                      }`}
                    >
                      <span className="mr-2">•</span>
                      Au moins 8 caractères
                    </li>
                    <li
                      className={`flex items-center ${
                        /[A-Z]/.test(password) ? "text-green-600" : ""
                      }`}
                    >
                      <span className="mr-2">•</span>
                      Une lettre majuscule
                    </li>
                    <li
                      className={`flex items-center ${
                        /[a-z]/.test(password) ? "text-green-600" : ""
                      }`}
                    >
                      <span className="mr-2">•</span>
                      Une lettre minuscule
                    </li>
                    <li
                      className={`flex items-center ${
                        /[!@#$%^&*(),.?":{}|<>\-_]/.test(password)
                          ? "text-green-600"
                          : ""
                      }`}
                    >
                      <span className="mr-2">•</span>
                      Un caractère spécial (!@#$%^&*(),.?":{}|&lt;&gt;-_)
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
