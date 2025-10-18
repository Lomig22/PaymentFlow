'use client';
import { useMemo, useState } from "react";
import OnboardingSpotlight, { SpotlightStep } from "../onboarding/OnboardingSpotlight";
import OnboardingTour from "../onboarding/OnboardingTour";
import OnboardingSurveyWizard from "../onboarding/OnboardingSurveyWizard";
import { useSupabase } from "../../app/providers/supabase-provider";

export function LayoutOnboarding() {
    const supabase = useSupabase();
    // État onboarding
    const [onboardingOpen, setOnboardingOpen] = useState(false);
    const [spotlightOpen, setSpotlightOpen] = useState(false);
    const [spotlightStep, setSpotlightStep] = useState(0);


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
                } catch { }
                try {
                    localStorage.setItem(`onboarding_seen_${uid}`, "1");
                } catch { }
            }
        } catch { }

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
            } catch { }
            setSpotlightOpen(false);
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
                } catch { }

                // Nettoyage du drapeau différé une fois traité (si présent)
                try {
                    localStorage.removeItem('onboarding_deferred');
                } catch { }

                // Nettoyage de l'URL pour ne pas relancer l'onboarding au refresh
                try {
                    const search = (typeof window !== 'undefined' ? window.location.search : location.search) || '';
                    const urlParams = new URLSearchParams(search);
                    if (urlParams.has('onboarding')) {
                        urlParams.delete('onboarding');
                        // router.replace({ pathname: router.pathname, query: Object.fromEntries(urlParams) });
                    }
                } catch { }
            }
        } catch { }
    };

    return <>
        {/* Onboarding wizard (étape enquête) */}
        <OnboardingTour
            open={onboardingOpen}
            step={0}
            steps={[{ title: "Apprenons à vous connaître", description: "Dites‑nous en plus sur votre rôle et votre entreprise." }]}
            onClose={() => { handleOnboardingDismiss(); setOnboardingOpen(false); }}
            onPrev={() => { }}
            onNext={() => { }}
            onComplete={() => { }}
            onAction={() => { }}
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
    </>
}