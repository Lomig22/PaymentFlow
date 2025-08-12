import React, { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  FileText,
  Settings,
  LogOut,
  X,
  Home,
  HelpCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import AbonnementInfo from "../components/settings/AbonnementInfo";
import useEnsureEmailSettings from "../lib/ensureEmailSettings";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEnsureEmailSettings();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);

      // Déconnexion de Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        if (
          error instanceof AuthSessionMissingError ||
          error.message.includes("session_not_found")
        ) {
          // Si l'erreur indique que la session n'existe pas, on considère que l'utilisateur est déjà déconnecté
          window.location.href = "/";
          return;
        }
        throw error;
      }

      // Redirection forcée vers la racine
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setLogoutError(
        "Une erreur est survenue lors de la déconnexion. Veuillez réessayer."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeLogoutModal = () => {
    setShowLogoutConfirm(false);
    setLogoutError(null);
  };

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: Home },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Créances", href: "/receivables", icon: FileText },
    { name: "Paramètres", href: "/settings", icon: Settings },
  ];
  //  console.log("Current path:", JSON.stringify(location.pathname));
  const handleSubscribe = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
      status: "active",
      plan: "free",
    });

    if (error) {
      console.error("Erreur création abonnement", error);
      return;
    }

    navigate("/dashboard");
  };
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const syncPendingProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) return;
      if (user?.email) {
        const { data: pending, error: fetchError } = await supabase
          .from("pending_profiles")
          .select("*")
          .eq("email", user.email);

        // Correction : ne redirige vers /signup que si le profil N'EXISTE PAS dans 'profiles'
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .single();

        if ((pending?.length === 0 || !pending) && !existingProfile) {
          await supabase.auth.signOut();
          navigate("/signup");
          return;
        }

        if (user?.email) {
          // On ne crée le profil que s'il n'existe pas déjà
          if (!existingProfile?.subscribe) {
            if (!fetchError && pending) {
              const { error: upsertError } = await supabase
                .from("profiles")
                .upsert([
                  {
                    id: user.id,
                    email: user.email,
                    name: pending[0].name,
                    phone: pending[0].phone,
                    company: pending[0].company,
                    subscribe: true,
                  },
                ]);

              if (upsertError) {
                console.error(
                  "Erreur lors de l’upsert dans pending_profiles:",
                  upsertError
                );
              }
            } else if (fetchError) {
              console.error(
                "Erreur lors de la récupération de pending_profiles:",
                fetchError
              );
              //navigate("/signup")
            }
          }
        }
      }
    };

    syncPendingProfile();
  }, []); // ne s'exécute qu'une seule fois au montage
  useEffect(() => {
    const verifySubscription = async () => {
      try {
        console.log("⏳ Vérification de la session utilisateur...");

        // Fonction pour limiter getSession à 3 secondes max
        const timeout = (delay: number) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("⏱ Timeout getSession")), delay)
          );

        let user = null;

        // 1. Tenter d'obtenir la session Supabase avec timeout
        try {
          const result = await Promise.race([
            supabase.auth.getSession(),
            timeout(3000),
          ]);
          const { data, error } = (result as { data: any; error: any }) || {};

          if (error) {
            console.warn("❌ Erreur Supabase getSession:", error.message);
          } else if (data?.session?.user) {
            user = data.session.user;
            console.log(
              "✅ Session récupérée via Supabase pour l'utilisateur :",
              user.id
            );
          }
        } catch (err) {
          if (err instanceof Error) {
            console.warn("⏱ Timeout ou erreur lors de getSession :", err.message);
          } else {
            console.warn("⏱ Timeout ou erreur lors de getSession :", err);
          }
        }

        // 2. Si pas de session, tenter depuis localStorage
        if (!user && localStorage.getItem("paymentflow-auth")) {
          console.log("📦 Tentative de récupération via localStorage...");
          try {
            const raw = localStorage.getItem("paymentflow-auth");
            let stored = null;
            try {
              stored = JSON.parse(raw || "{}");
            } catch (parseErr) {
              console.error("❌ Erreur parsing localStorage:", parseErr);
            }
            if (!stored) {
              console.warn("❌ Rien à parser dans localStorage");
            } else {
              const token = stored?.access_token;
              const refreshToken = stored?.refresh_token;
              const userData = stored?.user;
              if (token && refreshToken && userData) {
                // Tenter de restaurer la session Supabase
                const { data, error } = await supabase.auth.setSession({
                  access_token: token,
                  refresh_token: refreshToken,
                });
                if (error) {
                  console.warn("❌ Erreur lors de supabase.auth.setSession:", error.message);
                } else if (data?.session?.user) {
                  user = data.session.user;
                  console.log("✅ Session restaurée via Supabase pour l'utilisateur :", user.id);
                } else {
                  console.warn("⚠️ setSession n'a pas retourné d'utilisateur.");
                }
              } else {
                console.warn("❌ Token, refresh_token ou user manquant dans localStorage.");
              }
            }
          } catch (e) {
            console.error("❌ Erreur lors de la récupération locale:", e);
          }
        }

        // 3. Si aucune session valide → redirection
        if (!user) {
          console.warn("🔒 Aucune session valide. Redirection vers /login");
          // Évite la boucle si déjà sur /login ou /signup
          if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
            navigate("/login");
          }
          return;
        }

        // 4. Vérifier l'existence du profil utilisateur
        console.log("Recherche profil pour user.id =", user.id);
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id);

        if (profileError) {
          console.error(
            "❌ Erreur lors de la récupération du profil :",
            profileError
          );
          await supabase.auth.signOut();
          return;
        }

        if (!profiles || profiles.length === 0) {
          console.warn("Aucun profil trouvé pour cet utilisateur :", user.id);
          // Ici, tu peux rediriger ou afficher un message d'erreur
          navigate("/signup");
          return;
        } else {
          console.log("✅ Profil utilisateur trouvé :", profiles[0]);
        }
      } catch (e) {
        console.error("🔥 Erreur globale dans verifySubscription :", e);
      } finally {
        setChecking(false);
      }
    };

    verifySubscription();
  }, []);

  return (
    <div>
      {checking ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 animate-pulse">
              Vérification de votre compte...
            </h2>
            <p className="text-gray-500 text-sm">
              Merci de patienter un instant
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100">
          {/* Sidebar */}
          <div
            className={` fixed inset-y-0 left-0 bg-white shadow-lg transition-all duration-200 z-40  ${
              isExpanded ? "w-64" : "w-24"
            }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
          >
            {/* Logo */}

            <div className="px-4">
              <Link
                to="/"
                className="flex items-center h-16 px-4 border-b border-gray-200"
              >
                <TrendingUp className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <span
                  className={`ml-2 text-xl font-bold text-gray-900 overflow-hidden whitespace-nowrap transition-opacity duration-200 ${
                    isExpanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  PaymentFlow
                </span>
              </Link>
              {/* Navigation */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? location.pathname.startsWith("/dashboard")
                    : location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center ${
                      !isExpanded && "justify-center"
                    } px-4 py-3 my-2 text-sm font-medium rounded-md transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-inherit" />
                    <span
                      className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                        isExpanded ? "block opacity-100" : "hidden"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Pied du menu */}
            <div
              className={`absolute bottom-0 w-full left-0 ${
                isExpanded ? "px-6" : "px-0"
              }`}
            >
              <div className=" border-gray-200">
                <Link
                  to="/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center ${
                    !isExpanded && "justify-center"
                  }   w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-all duration-300`}
                >
                  <HelpCircle className="h-5 w-5 flex-shrink-0 text-inherit" />
                  <span
                    className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                      isExpanded ? "block opacity-100" : "hidden"
                    }`}
                  >
                    Aides et support
                  </span>
                </Link>
              </div>

              <div className="border-t border-gray-200">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className={`flex items-center  ${
                    !isExpanded && "justify-center"
                  } w-full px-4 py-6 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-all duration-300`}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0 text-inherit" />
                  <span
                    className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                      isExpanded ? "block opacity-100" : "hidden"
                    }`}
                  >
                    Déconnexion
                  </span>
                </button>
              </div>
            </div>
          </div>
          {/* Main content */}
          <header className="p-4 border-b flex justify-end items-center gap-4">
            <AbonnementInfo />

            <a
              href="/pricing"
              className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition font-medium shadow-sm"
            >
              Voir les tarifs
            </a>
          </header>

          <div className="pl-20 group-hover:pl-64 transition-all duration-200">
            <main>
              <Outlet />
            </main>
          </div>

          {/* Modal de confirmation de déconnexion */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirmation
                  </h3>
                  <button
                    onClick={closeLogoutModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {logoutError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {logoutError}
                  </div>
                )}
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={closeLogoutModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
