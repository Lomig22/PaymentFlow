import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  UserCog,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import AbonnementInfo from "../components/settings/AbonnementInfo";
import useEnsureEmailSettings from "../lib/ensureEmailSettings";
import OnboardingTour from "./onboarding/OnboardingTour";
import OnboardingSurveyWizard from "./onboarding/OnboardingSurveyWizard";
import OnboardingSpotlight, { SpotlightStep } from "./onboarding/OnboardingSpotlight";
import { ActionGuardProvider } from "./Common/ActionGuard";
import Swal from "sweetalert2";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotif, setUnreadNotif] = useState<number>(0);
  const notifChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // État onboarding
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightStep, setSpotlightStep] = useState(0);
  // Alertes globales
  const [emailAlert, setEmailAlert] = useState<string | null>(null);

  useEnsureEmailSettings();

  // Realtime unread notifications count for sidebar badge
  const refreshUnread = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id;
    if (!uid) { setUnreadNotif(0); return; }
    const { count } = await supabase
      .from("notifications")
      .select("id", { head: true, count: "exact" })
      .eq("owner_id", uid)
      .or('is_read.is.false,is_read.is.null');
    setUnreadNotif(count || 0);
  }, []);

  useEffect(() => {
    refreshUnread();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const ch = supabase
        .channel("notifications-sidebar")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          refreshUnread
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          refreshUnread
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          refreshUnread
        )
        .subscribe();
      notifChannelRef.current = ch;
    })();
    return () => { if (notifChannelRef.current) supabase.removeChannel(notifChannelRef.current); };
  }, [refreshUnread]);

  // Garde globale: si des changements non enregistrés existent sur /settings, prévenir lors d'une sortie
  const routePrevRef = useRef(location.pathname);
  useEffect(() => {
    const prevPath = routePrevRef.current;
    const nextPath = location.pathname;
    const hasUnsaved = (() => {
      try { return sessionStorage.getItem('unsaved:settings') === '1'; } catch { return false; }
    })();
    if (hasUnsaved && prevPath === '/settings' && nextPath !== '/settings') {
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
        if (!result.isConfirmed) {
          // Revenir immédiatement
          navigate(prevPath, { replace: true });
        } else {
          // Valider le départ
          try { sessionStorage.removeItem('unsaved:settings'); } catch {}
        }
      });
    }
    routePrevRef.current = nextPath;
  }, [location.pathname]);

  // Intercepter les clics sur <a> pour prévenir AVANT la navigation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (
        anchor &&
        anchor instanceof HTMLAnchorElement &&
        anchor.href &&
        anchor.origin === window.location.origin
      ) {
        const nextPath = anchor.pathname;
        const prevPath = location.pathname;
        let hasUnsaved = false;
        try { hasUnsaved = sessionStorage.getItem('unsaved:settings') === '1'; } catch {}
        if (hasUnsaved && prevPath === '/settings' && nextPath !== '/settings') {
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
              try { sessionStorage.removeItem('unsaved:settings'); } catch {}
              navigate(nextPath + anchor.search + anchor.hash);
            }
          });
        }
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [location.pathname, navigate]);

  // Ecoute un événement local pour rafraîchir immédiatement après une action UI (mark read)
  useEffect(() => {
    const handler = () => { refreshUnread(); };
    window.addEventListener('notifications:refresh', handler);
    return () => window.removeEventListener('notifications:refresh', handler);
  }, [refreshUnread]);

  // Fallback: rafraîchir sur focus/visibilité + polling périodique
  useEffect(() => {
    const onFocus = () => { refreshUnread(); };
    const onVis = () => { if (document.visibilityState === 'visible') refreshUnread(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    const id = window.setInterval(() => { refreshUnread(); }, 15000);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      window.clearInterval(id);
    };
  }, [refreshUnread]);

  // Vérification des prérequis email (affiche une alerte persistante + pastille sur Paramètres)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) { setEmailAlert(null); return; }
      const { data } = await supabase
        .from("email_settings")
        .select("provider_type,smtp_username,smtp_password,smtp_server")
        .eq("user_id", uid)
        .maybeSingle();
      const provider = (data?.provider_type || 'platform').toLowerCase();
      if (provider === 'platform') { setEmailAlert(null); return; }
      const hasUser = !!data?.smtp_username;
      const hasPass = !!data?.smtp_password && data?.smtp_password !== 'donthavetosaveit';
      const server = (data?.smtp_server || '').toLowerCase();
      const hasServer = !!server && server !== 'my.smtpserver.com';
      if (!(hasUser && hasPass && hasServer)) {
        setEmailAlert("Configuration email incomplète. Veuillez finaliser vos paramètres SMTP dans Paramètres > Email.");
      } else {
        setEmailAlert(null);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);

      // Marque localement l'onboarding comme vu/dismissed pour éviter un ré-affichage après reconnexion
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id as string | undefined;
        if (uid) {
          localStorage.setItem(`onboarding_dismissed_${uid}`, "1");
          localStorage.setItem(`onboarding_seen_${uid}`, "1");
        }
      } catch {}

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

  const handleOnboardingDismiss = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id as string | undefined;
      if (uid) {
        try {
          // Marque localement pour ne plus ré-afficher
          localStorage.setItem(`onboarding_dismissed_${uid}`, "1");
        } catch {}

        // Nettoyage du drapeau différé une fois traité (si présent)
        try {
          localStorage.removeItem('onboarding_deferred');
        } catch {}

        // Nettoyage de l'URL pour ne pas relancer l'onboarding au refresh
        try {
          const search = (typeof window !== 'undefined' ? window.location.search : location.search) || '';
          const urlParams = new URLSearchParams(search);
          if (urlParams.has('onboarding')) {
            urlParams.delete('onboarding');
            navigate({ pathname: location.pathname, search: urlParams.toString() ? `?${urlParams.toString()}` : '' }, { replace: true });
          }
        } catch {}
      }
    } catch {}
  };

  const closeLogoutModal = () => {
    setShowLogoutConfirm(false);
    setLogoutError(null);
  };

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: Home },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Créances", href: "/receivables", icon: FileText },
    { name: "Profils de relance", href: "/reminder-profiles", icon: UserCog },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Paramètres", href: "/settings", icon: Settings },
  ];
  const tourDataByHref: Record<string, string> = {
    "/dashboard": "nav-dashboard",
    "/clients": "nav-clients",
    "/receivables": "nav-receivables",
    "/reminder-profiles": "nav-profiles",
    "/settings": "nav-settings",
  };

  const spotlightSteps = useMemo<SpotlightStep[]>(
    () => [
      {
        target: '[data-tour="nav-settings"]',
        title: "Configurer l'expéditeur",
        description:
          "Renseignez l'adresse d'envoi et personnalisez votre signature pour des emails professionnels.",
        placement: "right",
        padding: 8,
      },
      {
        target: '[data-tour="nav-clients"]',
        title: "Ajouter vos clients",
        description:
          "Ajoutez un client ou importez-en plusieurs pour préparer vos relances.",
        placement: "right",
        padding: 8,
      },
      {
        target: '[data-tour="nav-receivables"]',
        title: "Importer vos créances",
        description:
          "Importez vos factures en CSV ou créez-en quelques-unes pour tester les relances.",
        placement: "right",
        padding: 8,
      },
      {
        target: '[data-tour="nav-profiles"]',
        title: "Créer un profil de relance",
        description:
          "Définissez les délais et modèles d'emails. Vous l'assignerez ensuite à vos clients.",
        placement: "right",
        padding: 8,
      },
      {
        target: '[data-tour="nav-clients"]',
        title: "Assigner le profil",
        description:
          "Depuis la liste des clients, assignez votre profil de relance et activez les relances.",
        placement: "right",
        padding: 8,
      },
      {
        target: '[data-tour="nav-dashboard"]',
        title: "Suivre vos performances",
        description:
          "Retrouvez vos KPIs clés et l'état des relances dans le tableau de bord.",
        placement: "right",
        padding: 8,
      },
    ],
    []
  );

  const handleSurveySaved = async () => {
    // Marquer comme vu dès la fin du questionnaire
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const uid = user?.id as string | undefined;
      if (uid) {
        try {
          await supabase
            .from("profiles")
            .update({ onboarding_seen: true })
            .eq("id", uid);
        } catch {}
        try {
          localStorage.setItem(`onboarding_seen_${uid}`, "1");
        } catch {}
      }
    } catch {}

    setOnboardingOpen(false);
    setSpotlightStep(0);
    setSpotlightOpen(true);
  };

  const handleOnboardingComplete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ onboarding_seen: true })
          .eq("id", user.id);
      }
    } catch (e) {
      // ignore si la colonne n'existe pas
    } finally {
      try {
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if (uid) {
          localStorage.setItem(`onboarding_seen_${uid}`, "1");
        }
      } catch {}
      setSpotlightOpen(false);
    }
  };
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
          console.warn(
            "Aucun pending_profile ni profil existant — création d'un profil minimal"
          );
          try {
            await supabase
              .from("profiles")
              .upsert([
                {
                  id: user.id,
                  email: user.email,
                  subscribe: false,
                },
              ]);
          } catch (e) {
            console.error("Échec de création du profil minimal:", e);
          }
        }

        if (user?.email) {
          // On ne crée le profil que s'il n'existe pas déjà
          if (!existingProfile?.subscribe) {
            if (!fetchError && Array.isArray(pending) && pending.length > 0) {
              const p0 = pending[0];
              const { error: upsertError } = await supabase
                .from("profiles")
                .upsert([
                  {
                    id: user.id,
                    email: user.email,
                    name: p0?.name ?? "",
                    phone: p0?.phone ?? "",
                    company: p0?.company ?? "",
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

        // Fonction pour limiter getUser à 3 secondes max
        const timeout = (delay: number) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("⏱ Timeout getUser")), delay)
          );

        let user: null | { id: string; email?: string | null } = null;

        // 1. Tenter d'obtenir l'utilisateur côté serveur (plus fiable) avec timeout
        try {
          const result = await Promise.race([
            supabase.auth.getUser(),
            timeout(3000),
          ]);
          const { data, error } = (result as { data?: any; error?: any }) || {};

          if (error) {
            console.warn("❌ Erreur Supabase getUser:", error.message);
          } else if (data?.user) {
            user = data.user;
            const uid: string = data.user.id;
            console.log("✅ Utilisateur vérifié côté serveur:", uid);
          }
        } catch (err) {
          if (err instanceof Error) {
            console.warn("⏱ Timeout ou erreur lors de getUser :", err.message);
          } else {
            console.warn("⏱ Timeout ou erreur lors de getUser :", err);
          }
        }

        // 2. Si aucune session valide → ne pas forcer de redirection ici (AppRoutes gère la protection)
        if (!user) {
          console.warn("🔒 Aucune session valide (Layout). On laisse le routeur supérieur gérer.");
          return;
        }

        const userId = user.id as string;
        const userEmail = (user as any).email ?? null;

        // 3. Vérifier l'existence du profil utilisateur
        console.log("Recherche profil pour user.id =", userId);
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId);

        if (profileError) {
          console.error(
            "❌ Erreur lors de la récupération du profil (on continue sans déconnexion):",
            profileError
          );
        }

        // Détecter le déclencheur via URL ?onboarding=1
        const search = (typeof window !== 'undefined' ? window.location.search : location.search) || '';
        const urlParams = new URLSearchParams(search);
        // Supabase passe souvent les tokens et le type (signup) dans le hash (#...)
        const hash = (typeof window !== 'undefined' ? window.location.hash : '') || '';
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
        const isSignupFlow = (hashParams.get('type') === 'signup') || (urlParams.get('type') === 'signup');
        let hasDeferredTrigger = false;
        try {
          hasDeferredTrigger = localStorage.getItem('onboarding_deferred') === '1';
        } catch {}
        const hasQueryTrigger = urlParams.get('onboarding') === '1' || isSignupFlow || hasDeferredTrigger;

        if (!profiles || profiles.length === 0) {
          console.warn("Aucun profil trouvé pour cet utilisateur :", userId, "— création d'un profil minimal");
          try {
            await supabase
              .from("profiles")
              .upsert([
                { id: userId, email: userEmail, subscribe: false },
              ]);
          } catch (e) {
            console.error("Échec de création du profil minimal:", e);
          }
          // Afficher l'onboarding uniquement si le lien email comporte ?onboarding=1
          if (hasQueryTrigger) {
            setOnboardingOpen(true);
          }
        } else {
          console.log("✅ Profil utilisateur trouvé :", profiles[0]);
          // Déclenchement onboarding si non vu (clé par utilisateur uniquement)
          const dbSeen = !!(profiles && profiles[0] && (profiles[0] as any).onboarding_seen === true);
          let localSeen = false;
          try {
            const localKeySeen = `onboarding_seen_${userId}`;
            const localKeyDismissed = `onboarding_dismissed_${userId}`;
            localSeen =
              localStorage.getItem(localKeySeen) === "1" ||
              localStorage.getItem(localKeyDismissed) === "1";
          } catch {}
          // Si déclencheur présent (query/hash/différé), ignorer les indicateurs locaux
          // et n'ouvrir qu'une seule fois tant que la DB n'est pas marquée vue.
          if (hasQueryTrigger && !dbSeen) {
            setOnboardingOpen(true);
          }
        }

        // 3.b Réplication du questionnaire local vers la base si présent
        try {
          const localKeySurvey = `onboarding_survey_${userId}`;
          const rawSurvey = localStorage.getItem(localKeySurvey);
          if (rawSurvey) {
            try {
              const parsed = JSON.parse(rawSurvey);
              const { error: surveyErr } = await supabase
                .from("profiles")
                .update({ onboarding_survey: parsed })
                .eq("id", userId);
              if (!surveyErr) {
                localStorage.removeItem(localKeySurvey);
                console.log("✅ Questionnaire d'onboarding répliqué en base");
              } else {
                console.warn("⚠️ Échec de réplication du questionnaire:", surveyErr.message);
              }
            } catch (parseErr) {
              console.warn("⚠️ Impossible de parser le questionnaire local:", parseErr);
            }
          }
        } catch {}
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
                    data-tour={tourDataByHref[item.href]}
                    className={`relative flex items-center ${
                      !isExpanded && "justify-center"
                    } px-4 py-3 my-2 text-sm font-medium rounded-md transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                  >
                    <span className="relative">
                      <Icon className="h-5 w-5 flex-shrink-0 text-inherit" />
                      {item.href === "/notifications" && unreadNotif > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                      )}
                      {item.href === "/settings" && !!emailAlert && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                      )}
                    </span>
                    <span
                      className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                        isExpanded ? "block opacity-100" : "hidden"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isExpanded && item.href === "/notifications" && unreadNotif > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center text-[10px] leading-none font-semibold h-4 min-w-[16px] px-1 rounded-full bg-red-600 text-white shadow">
                        {unreadNotif > 99 ? "99+" : unreadNotif}
                      </span>
                    )}
                    {isExpanded && item.href === "/settings" && !!emailAlert && (
                      <span className="ml-auto inline-flex items-center justify-center text-[10px] leading-none font-semibold h-4 min-w-[16px] px-1 rounded-full bg-red-600 text-white shadow">!</span>
                    )}
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
          <ActionGuardProvider>
            {emailAlert && (
              <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-2 flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{emailAlert}</span>
                <Link to="/settings" className="underline font-medium">Corriger</Link>
              </div>
            )}
            <header className="p-4 border-b flex justify-end items-center gap-4">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition font-medium shadow-sm"
              >
                Notifications
              </Link>
              <AbonnementInfo />

              <a
                href="/pricing"
                className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition font-medium shadow-sm"
              >
                Voir les tarifs
              </a>
            </header>

            <div className={`transition-all duration-200 ${isExpanded ? 'pl-64' : 'pl-24'}`}>
              <main>
                <Outlet />
              </main>
            </div>
          </ActionGuardProvider>

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

          {/* Onboarding wizard (étape enquête) */}
          <OnboardingTour
            open={onboardingOpen}
            step={0}
            steps={[{ title: "Apprenons à vous connaître", description: "Dites‑nous en plus sur votre rôle et votre entreprise." }]}
            onClose={() => { handleOnboardingDismiss(); setOnboardingOpen(false); }}
            onPrev={() => {}}
            onNext={() => {}}
            onComplete={() => {}}
            onAction={() => {}}
            renderStep={() => (
              <OnboardingSurveyWizard onDone={handleSurveySaved} />
            )}
            hideFooterForStep={() => true}
          />

          {/* Spotlight interactif */}
          <OnboardingSpotlight
            open={spotlightOpen}
            stepIndex={spotlightStep}
            onPrev={() => setSpotlightStep((s) => Math.max(0, s - 1))}
            onNext={() => setSpotlightStep((s) => Math.min(spotlightSteps.length - 1, s + 1))}
            onClose={() => { handleOnboardingDismiss(); setSpotlightOpen(false); }}
            onComplete={handleOnboardingComplete}
            steps={spotlightSteps}
          />
        </div>
      )}
    </div>
  );
}
