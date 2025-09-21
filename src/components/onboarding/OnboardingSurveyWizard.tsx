import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

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
      if (error) throw error;
      onDone();
    } catch (e: any) {
      console.error("Erreur sauvegarde du survey:", e);
      setError(e?.message || "Impossible d'enregistrer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-4 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Étape {step + 1} / 3</span>
      </div>

      {step === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700">Votre rôle</label>
            <select
              value={data.role}
              onChange={(e) => setData((d) => ({ ...d, role: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner…</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Département</label>
            <select
              value={data.department}
              onChange={(e) => setData((d) => ({ ...d, department: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner…</option>
              {DEPARTMENTS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700">Taille de l'entreprise</label>
            <select
              value={data.company_size}
              onChange={(e) => setData((d) => ({ ...d, company_size: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner…</option>
              {COMPANY_SIZES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Secteur d'activité</label>
            <select
              value={data.industry}
              onChange={(e) => setData((d) => ({ ...d, industry: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner…</option>
              {INDUSTRIES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs principaux</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => {
                const active = data.goals?.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      active ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Comment nous avez-vous trouvé ?</label>
              <select
                value={data.referrer}
                onChange={(e) => setData((d) => ({ ...d, referrer: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner…</option>
                {REFERRERS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Outils actuels (optionnel)</label>
              <input
                type="text"
                value={data.current_tools}
                onChange={(e) => setData((d) => ({ ...d, current_tools: e.target.value }))}
                placeholder="Ex: Excel, logiciel comptable, ERP…"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone (optionnel)</label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="06…"
              />
            </div>
            <label className="mt-7 flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={!!data.consent_contact}
                onChange={(e) => setData((d) => ({ ...d, consent_contact: e.target.checked }))}
              />
              J'accepte d'être recontacté(e) pour optimiser mon onboarding
            </label>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 sm:mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={step === 0}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
        >
          Précédent
        </button>
        {step < 2 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext()}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Suivant
          </button>
        ) : (
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Terminer"}
          </button>
        )}
      </div>

      <style>{`
        .animate-fade-in { animation: fadein .25s ease; }
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
