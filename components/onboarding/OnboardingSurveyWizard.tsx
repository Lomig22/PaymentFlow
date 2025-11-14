import React, { useState } from "react";
import OnboardingLayout from "./OnboardingLayout";
import OnboardingStep from "./OnboardingStep";
import {
  User as UserIcon,
  Briefcase,
  Users,
  Building2,
  Wrench,
  Factory,
  ShoppingCart,
  Shield,
  Calculator,
  Target,
  BarChart3,
  CreditCard,
  Search,
  Linkedin,
  Mail,
  Megaphone,
  MoreHorizontal,
  Phone as PhoneIcon,
  Stethoscope,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSupabase } from "../../app/providers/supabase-provider";

export type SurveyWizardData = {
  role?: string;
  department?: string;
  company_size?: string;
  industry?: string;
  goals?: string[];
  referrer?: string;
  current_tools?: string;
  phone?: string;
  consent_contact?: boolean;
};

type OnboardingSurveyWizardProps = {
  onDone: () => void;
};

const ROLES = [
  "Dirigeant / CEO",
  "DAF / Finance",
  "Comptable",
  "Recouvrement / Credit manager",
  "Commercial",
  "Autre",
];
const DEPARTMENTS = [
  "Direction",
  "Finance",
  "Comptabilité",
  "Recouvrement",
  "Commerce",
  "Autre",
];
const COMPANY_SIZES = ["1-2", "3-10", "11-50", "51-200", "201-500", "> 500"];
const INDUSTRIES = [
  "Garage / Automobile",
  "Industrie",
  "Services",
  "Commerce",
  "BTP",
  "Santé",
  "Autre",
];
const GOALS = [
  "Automatiser les relances",
  "Réduire le DSO / retards",
  "Centraliser les paiements",
  "Améliorer la communication",
  "Suivre la performance",
  "Autre",
];
const REFERRERS = [
  "Google",
  "LinkedIn",
  "Bouche-à-oreille",
  "Email",
  "Publicité",
  "Autre",
];

export default function OnboardingSurveyWizard({ onDone }: OnboardingSurveyWizardProps) {
  const supabase = useSupabase();
  const [step, setStep] = useState(0); // 0..2
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SurveyWizardData>({
    role: "",
    department: "",
    company_size: "",
    industry: "",
    goals: [],
    referrer: "",
    current_tools: "",
    phone: "",
    consent_contact: false,
  });

  const next = () => setStep((s) => Math.min(2, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const canNext = () => {
    if (step === 0) return !!data.role && !!data.department;
    if (step === 1) return !!data.company_size && !!data.industry;
    return true;
  };

  const toggleGoal = (g: string) => {
    setData((d) => ({
      ...d,
      goals: d.goals?.includes(g) ? d.goals!.filter((x) => x !== g) : [...(d.goals || []), g],
    }));
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Utilisateur non connecté");
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_survey: data })
        .eq("id", user.id);
      if (error) {
        const code = (error as any)?.code;
        const msg = String((error as any)?.message || "");
        // Fallback si la colonne n'existe pas encore côté DB (migrations non appliquées)
        if (code === "PGRST204" || msg.includes("onboarding_survey")) {
          try {
            localStorage.setItem(`onboarding_survey_${user.id}`, JSON.stringify(data));
            onDone();
            return;
          } catch {
            // si le localStorage échoue, on laisse remonter l'erreur d'origine
          }
        }
        throw error;
      }
      onDone();
    } catch (e: any) {
      console.error("Erreur sauvegarde du survey:", e);
      setError(e?.message || "Impossible d'enregistrer");
    } finally {
      setSaving(false);
    }
  };

  // Build rich options with icons
  const ROLE_OPTIONS = [
    { label: "Dirigeant / CEO", value: "Dirigeant / CEO", icon: UserIcon },
    { label: "DAF / Finance", value: "DAF / Finance", icon: Briefcase },
    { label: "Comptable", value: "Comptable", icon: Calculator as any },
    { label: "Recouvrement / Credit manager", value: "Recouvrement / Credit manager", icon: Shield },
    { label: "Commercial", value: "Commercial", icon: Users },
    { label: "Autre", value: "Autre", icon: MoreHorizontal },
  ];

  const DEPARTMENT_OPTIONS = [
    { label: "Direction", value: "Direction", icon: UserIcon },
    { label: "Finance", value: "Finance", icon: Briefcase },
    { label: "Comptabilité", value: "Comptabilité", icon: Calculator as any },
    { label: "Recouvrement", value: "Recouvrement", icon: Shield },
    { label: "Commerce", value: "Commerce", icon: ShoppingCart },
    { label: "Autre", value: "Autre", icon: MoreHorizontal },
  ];

  const COMPANY_SIZE_OPTIONS = COMPANY_SIZES.map((s) => ({
    label: s,
    value: s,
    icon: Users,
  }));

  const INDUSTRY_OPTIONS = [
    { label: "Garage / Automobile", value: "Garage / Automobile", icon: Wrench },
    { label: "Industrie", value: "Industrie", icon: Factory },
    { label: "Services", value: "Services", icon: Briefcase },
    { label: "Commerce", value: "Commerce", icon: ShoppingCart },
    { label: "BTP", value: "BTP", icon: Building2 },
    { label: "Santé", value: "Santé", icon: Stethoscope as any },
    { label: "Autre", value: "Autre", icon: MoreHorizontal },
  ];

  const GOAL_OPTIONS = [
    { label: "Automatiser les relances", value: "Automatiser les relances", icon: Target },
    { label: "Réduire le DSO / retards", value: "Réduire le DSO / retards", icon: BarChart3 },
    { label: "Centraliser les paiements", value: "Centraliser les paiements", icon: CreditCard },
    { label: "Améliorer la communication", value: "Améliorer la communication", icon: Megaphone },
    { label: "Suivre la performance", value: "Suivre la performance", icon: BarChart3 },
    { label: "Autre", value: "Autre", icon: MoreHorizontal },
  ];

  const REFERRER_OPTIONS = [
    { label: "Google", value: "Google", icon: Search },
    { label: "LinkedIn", value: "LinkedIn", icon: Linkedin },
    { label: "Bouche-à-oreille", value: "Bouche-à-oreille", icon: Users },
    { label: "Email", value: "Email", icon: Mail },
    { label: "Publicité", value: "Publicité", icon: Megaphone },
    { label: "Autre", value: "Autre", icon: MoreHorizontal },
  ];

  return (
    <OnboardingLayout
      step={step}
      total={3}
      canNext={canNext()}
      saving={saving}
      onPrev={prev}
      onNext={next}
      onFinish={saveAll}
    >
      {error && (
        <div className="mb-4 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="grid grid-cols-1 gap-6">
              <OnboardingStep
                title="Votre rôle"
                options={ROLE_OPTIONS}
                selected={data.role || ""}
                onSelect={(value) => setData((d) => ({ ...d, role: value }))}
              />
              <OnboardingStep
                title="Département"
                options={DEPARTMENT_OPTIONS}
                selected={data.department || ""}
                onSelect={(value) => setData((d) => ({ ...d, department: value }))}
              />
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-6">
              <OnboardingStep
                title="Taille de l'entreprise"
                options={COMPANY_SIZE_OPTIONS}
                selected={data.company_size || ""}
                onSelect={(value) => setData((d) => ({ ...d, company_size: value }))}
              />
              <OnboardingStep
                title="Secteur d'activité"
                options={INDUSTRY_OPTIONS}
                selected={data.industry || ""}
                onSelect={(value) => setData((d) => ({ ...d, industry: value }))}
              />
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-6">
              <OnboardingStep
                title="Objectifs principaux"
                options={GOAL_OPTIONS}
                multi
                selectedList={data.goals || []}
                onToggle={(value) => toggleGoal(value)}
              />

              <OnboardingStep
                title="Comment nous avez-vous trouvé ?"
                options={REFERRER_OPTIONS}
                selected={data.referrer || ""}
                onSelect={(value) => setData((d) => ({ ...d, referrer: value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Outils actuels (optionnel)</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      value={data.current_tools}
                      onChange={(e) => setData((d) => ({ ...d, current_tools: e.target.value }))}
                      placeholder="Ex: Excel, logiciel comptable, ERP…"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone (optionnel)</label>
                  <div className="relative mt-1">
                    <PhoneIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                      className="pl-9 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="06…"
                    />
                  </div>
                </div>
              </div>

              <label className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={!!data.consent_contact}
                  onChange={(e) => setData((d) => ({ ...d, consent_contact: e.target.checked }))}
                />
                J'accepte d'être recontacté(e) pour optimiser mon onboarding
              </label>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
