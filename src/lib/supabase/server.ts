import { createServerClient } from '@supabase/ssr'
import { differenceInDays, isBefore } from 'date-fns';
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies();

    const options: Parameters<typeof createServerClient>[2] = {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        }
    };

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        options
    );
    return supabase;
}

export async function verifySubscription(): Promise<{ subscribed: boolean, onboard: boolean }> {
    const supabase = await createClient();
    let onboard: boolean = false;
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
            return { subscribed: false, onboard };
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
            } catch { }
            // Si déclencheur présent (query/hash/différé), ignorer les indicateurs locaux
            // et n'ouvrir qu'une seule fois tant que la DB n'est pas marquée vue.
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
        } catch { }
    } catch (e) {
        console.error("🔥 Erreur globale dans verifySubscription :", e);
    }
    return { subscribed: true, onboard };
};

export async function syncPendingProfile() {

    const supabase = await createClient();
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

export async function ensureEmailSettings() {
    const supabase = await createClient();
    // Vérifie l'utilisateur côté serveur pour éviter d'agir avec une session invalide
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;
    if (!userId) return;

    // Vérifie si une configuration existe déjà
    const { data, error: fetchError } = await supabase
        .from('email_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur de récupération:', fetchError);
        return;
    }

    if (!data) {
        // Insère uniquement si aucune configuration n’existe
        const { error: insertError } = await supabase
            .from('email_settings')
            .insert({
                user_id: userId,
                provider_type: 'platform',
                smtp_username: '',
                smtp_password: '',
                smtp_server: '',
                smtp_port: 587,
                smtp_encryption: 'tls',
                email_signature: '',
                updated_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error('Erreur d’insertion:', insertError);
        }
    }
};


export async function fetchAbonnementInfo(): Promise<{ isExpired: boolean, abonnement: string | null, expiryDate: string | null, rawExpiryDate: Date | null, resteEmail: number }> {
    let isExpired: boolean = false;
    let abonnement: string | null = null;
    let expiryDate: string | null = null;
    let rawExpiryDate: Date | null = null;
    let resteEmail: number = 0;

    const supabase = await createClient();
    try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) {
            isExpired = true;
            return { isExpired, abonnement, expiryDate, rawExpiryDate, resteEmail };
        }

        // Étape 1 : Vérification période d'essai
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();
        const daysSinceCreation = differenceInDays(now, userCreatedAt);
        const essaiDuration = 30;

        if (daysSinceCreation < essaiDuration) {
            abonnement = "Essai gratuit";
            rawExpiryDate = null;
            expiryDate = `${essaiDuration - daysSinceCreation} jour(s)`;
            isExpired = false;
        } else {
            // Étape 2 : Vérifier abonnement actif
            const { data: abonnementData, error: abonnementError } = await supabase
                .from("subscriptions")
                .select("plan, status, subscription_expiry")
                .eq("user_id", user.id);

            if (abonnementError) {
                console.error("Erreur récupération abonnement:", abonnementError);
                return Promise.reject("Erreur récupération abonnement: " + abonnementError.message);
            }

            if (abonnementData && abonnementData.length > 0) {
                // 2.a: plan 'free' actif sans expiration -> considérer comme non expiré
                const hasActiveFree = abonnementData.some(
                    (row: any) => (row.plan === "free" || row.plan === "gratuit") && (row.status ?? "active") === "active"
                );
                if (hasActiveFree) {
                    return { isExpired: false, abonnement: "free", expiryDate: "illimité", rawExpiryDate: null, resteEmail };
                }

                // 2.b: sinon, on regarde la dernière date d'expiration disponible
                const latest = abonnementData
                    .filter((row: any) => row.subscription_expiry)
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.subscription_expiry).getTime() -
                            new Date(a.subscription_expiry).getTime()
                    )[0];

                if (latest?.subscription_expiry) {
                    const expiry = new Date(latest.subscription_expiry);
                    const expired = isBefore(expiry, now);

                    abonnement = latest.plan || null;
                    rawExpiryDate = expiry;
                    expiryDate = new Intl.DateTimeFormat('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }).format(expiry);
                    isExpired = expired;
                    return { isExpired, abonnement, expiryDate, rawExpiryDate, resteEmail };
                } else {
                    return {
                        isExpired: true,
                        abonnement: null,
                        expiryDate: null,
                        rawExpiryDate: null,
                        resteEmail
                    };
                }
            } else {
                console.log("No active subscription found for user:", user.id);
                return {
                    isExpired: true,
                    abonnement: null,
                    expiryDate,
                    rawExpiryDate,
                    resteEmail
                };
            }
        }

        // Étape 3 : Récupérer compteur d'emails
        // const { data: userProfile } = await supabase
        //   .from("profiles")
        //   .select("email_counter")
        //   .eq("id", user.id)
        //   .maybeSingle();

        // setResteEmail(userProfile?.email_counter ?? 0);
        return { isExpired, abonnement, expiryDate, rawExpiryDate, resteEmail };
    } catch (err: any) {
        console.error("Erreur inattendue dans useAbonnementCheck:", err);
        return Promise.reject("Erreur inattendue: " + (err.message || JSON.stringify(err)));
    }
};

export async function fetchProfiles(): Promise<any[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return [];
    }
    let profiles: any[] | null = null;
    // On récupère tous les profils uniques de l'utilisateur
    const { data, error } = await supabase
        .from("reminder_profile")
        .select("*")
        .eq("owner_id", user.id)
        .eq("public", false);
    if (!data) {
        return [];
    }
    profiles = data ?? null;
    return profiles;
}

export async function fetchRecords(): Promise<any[]> {
    const supabase = await createClient();
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non authentifié");

        const { data: clientsData, error } = await supabase
            .from("reminders")
            .select(
                `
              *,
              receivable:receivables(
                *,
                client:clients(*)
              )
            `
            )
            .eq("receivable.owner_id", user.id)
            .order("reminder_date", { ascending: false });

        if (error) throw error;
        return clientsData ?? [];
    } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        return Promise.reject("Impossible de charger la liste des clients");
    }
}