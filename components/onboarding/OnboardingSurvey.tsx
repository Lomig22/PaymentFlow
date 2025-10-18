import React, { useState } from "react";
import { useSupabase } from "../../app/providers/supabase-provider";

export type OnboardingSurveyData = {
  role: string;
  department: string;
  company_size: string;
  industry: string;
  goals: string[];
  referrer: string;
  current_tools: string;
  import_intent: string;
  phone?: string;
  consent_contact?: boolean;
};

type OnboardingSurveyProps = {
  onSaved: (data: OnboardingSurveyData) => void;
  onSkip?: () => void;
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

export default function OnboardingSurvey({ onSaved, onSkip }: OnboardingSurveyProps) {
  const supabase = useSupabase();
  const [form, setForm] = useState<OnboardingSurveyData>({
    role: "",
    department: "",
    company_size: "",
    industry: "",
    goals: [],
    referrer: "",
    current_tools: "",
    import_intent: "",
    phone: "",
    consent_contact: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGoal = (g: string) => {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Utilisateur non connecté");

      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_survey: form })
        .eq("id", user.id);
      if (error) throw error;

      onSaved(form);
    } catch (err: any) {
      console.error("Erreur sauvegarde du survey:", err);
      setError(err?.message || "Impossible d'enregistrer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4">
      {error && (
        <div className="p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Rôle & Département */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Votre rôle</label>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner…</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Département</label>
          <select
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Taille & Secteur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Taille de l'entreprise</label>
          <select
            value={form.company_size}
            onChange={(e) => setForm((f) => ({ ...f, company_size: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner…</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Secteur d'activité</label>
          <select
            value={form.industry}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner…</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Objectifs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vos objectifs principaux</label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const active = form.goals.includes(g);
            return (
              <button
                type="button"
                key={g}
                onClick={() => toggleGoal(g)}
                className={`px-3 py-1.5 rounded-full text-sm border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment nous avez-vous trouvé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Comment nous avez-vous trouvé ?</label>
          <select
            value={form.referrer}
            onChange={(e) => setForm((f) => ({ ...f, referrer: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner…</option>
            {REFERRERS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Outils actuels</label>
          <input
            type="text"
            value={form.current_tools}
            onChange={(e) => setForm((f) => ({ ...f, current_tools: e.target.value }))}
            placeholder="Ex: Excel, logiciel comptable, ERP…"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Intention d'import + téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Souhaitez-vous importer des créances maintenant ?</label>
          <select
            value={form.import_intent}
            onChange={(e) => setForm((f) => ({ ...f, import_intent: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner…</option>
            <option value="oui">Oui</option>
            <option value="plus tard">Plus tard</option>
            <option value="non">Non</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone (optionnel)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="06…"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={form.consent_contact}
              onChange={(e) => setForm((f) => ({ ...f, consent_contact: e.target.checked }))}
            />
            J'accepte d'être recontacté(e) pour optimiser mon onboarding
          </label>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Continuer"}
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            Passer
          </button>
        )}
      </div>
    </form>
  );
}
