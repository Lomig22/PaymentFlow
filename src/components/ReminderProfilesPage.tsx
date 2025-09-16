import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Plus } from "lucide-react";

export default function ReminderProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "Nouveau profil",
    delay1: { j: 1, h: 0, m: 0 },
    delay2: { j: 1, h: 0, m: 0 },
    delay3: { j: 1, h: 0, m: 0 },
    delay4: { j: 1, h: 0, m: 0 },
    email_template_1: "",
    email_template_2: "",
    email_template_3: "",
    email_template_4: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }
    // On récupère tous les profils uniques de l'utilisateur
    const { data, error } = await supabase
      .from("reminder_profile")
      .select("*")
      .eq("owner_id", user.id)
      .eq("public", false);
    if (!error) setProfiles(data || []);
    setLoading(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate(): boolean {
    const newErrors: any = { delays: {} };
    const nameLen = (form.name || '').trim().length;
    if (nameLen < 3 || nameLen > 50) {
      newErrors.name = "Le nom doit contenir entre 3 et 50 caractères.";
    }
    for (let num = 1; num <= 4; num++) {
      const d = (form as any)[`delay${num}`] as { j: number; h: number; m: number };
      const ed: any = {};
      if (d.j < 0) ed.j = "Jours doit être ≥ 0";
      if (d.h < 0 || d.h > 23) ed.h = "Heures doit être entre 0 et 23";
      if (d.m < 0 || d.m > 59) ed.m = "Minutes doit être entre 0 et 59";
      if (Object.keys(ed).length > 0) newErrors.delays[num] = ed;
    }
    setErrors(newErrors);
    return !newErrors.name && Object.keys(newErrors.delays).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dataToSave = {
      name: form.name,
      delay1: form.delay1,
      delay2: form.delay2,
      delay3: form.delay3,
      delay4: form.delay4,
      email_template_1: form.email_template_1,
      email_template_2: form.email_template_2,
      email_template_3: form.email_template_3,
      email_template_4: form.email_template_4,
      owner_id: user.id,
      public: false,
    };
    if (editingId) {
      await supabase.from("reminder_profile").update(dataToSave).eq("id", editingId);
    } else {
      await supabase.from("reminder_profile").insert(dataToSave);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "Nouveau profil",
      delay1: { j: 1, h: 0, m: 0 },
      delay2: { j: 1, h: 0, m: 0 },
      delay3: { j: 1, h: 0, m: 0 },
      delay4: { j: 1, h: 0, m: 0 },
      email_template_1: "",
      email_template_2: "",
      email_template_3: "",
      email_template_4: "",
    });
    fetchProfiles();
  }

  function handleEdit(profile: any) {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      delay1: profile.delay1,
      delay2: profile.delay2,
      delay3: profile.delay3,
      delay4: profile.delay4,
      email_template_1: profile.email_template_1 || "",
      email_template_2: profile.email_template_2 || "",
      email_template_3: profile.email_template_3 || "",
      email_template_4: profile.email_template_4 || "",
    });
    setShowForm(true);
  }


  async function handleDelete(id: string) {
    confirmAlert({
      title: "Confirmation",
      message: "Êtes-vous sûr de vouloir supprimer ce profil de relance ?",
      buttons: [
        {
          label: "Oui",
          onClick: async () => {
            // UI optimiste
            setProfiles((prev) => prev.filter((p) => p.id !== id));
            const { error } = await supabase.from("reminder_profile").delete().eq("id", id);
            if (error) {
              // Si référence côté clients empêche la suppression, on délient puis on réessaie
              await supabase.from("clients").update({ reminder_profile: null }).eq("reminder_profile", id);
              await supabase.from("reminder_profile").delete().eq("id", id);
            }
            fetchProfiles();
          },
        },
        {
          label: "Non",
          className: "no-button",
        },
      ],
    });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className=" ml-4 text-2xl font-bold text-gray-900">Profils de relance</h1>
        {!showForm && (
          <div className="flex items-center gap-3">
            <button
              disabled={profiles.length >= 3}
              onClick={() => {
                if (profiles.length >= 3) return;
                setForm({
                  name: "Nouveau profil",
                  delay1: { j: 1, h: 0, m: 0 },
                  delay2: { j: 1, h: 0, m: 0 },
                  delay3: { j: 1, h: 0, m: 0 },
                  delay4: { j: 1, h: 0, m: 0 },
                  email_template_1: "",
                  email_template_2: "",
                  email_template_3: "",
                  email_template_4: "",
                });
                setEditingId(null);
                setShowForm(true);
              }}
              className={`flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${profiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="h-5 w-5" />
              Créer un profil
            </button>
            {profiles.length >= 3 && (
              <span className="text-xs text-gray-500">Limite de 3 profils atteinte.</span>
            )}
          </div>
        )}
      </div>
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">Chargement...</div>
        ) : profiles.length === 0 && !showForm ? (
          <div>
            <div className="flex justify-center items-center h-60">
              <p className="text-gray-500">Aucun profil enregistré pour le moment.</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4"></div>
            {showForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
                <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Fermer"
                  >
                    ×
                  </button>
                  <form
                    onSubmit={handleSave}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium">Nom du profil</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className="mt-2 block w-full border-gray-300 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={50}
                        required
                      />
                    </div>
                    {[1, 2, 3, 4].map((num) => {
                      const delay = (form as any)[`delay${num}`] as any;
                      return (
                        <div key={num} className="flex flex-wrap gap-3 items-end">
                          <div className="font-semibold">Délais {num}</div>
                          <div>
                            <label className="block text-xs">Jours</label>
                            <input
                              type="number"
                              value={delay.j}
                              min={0}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  [`delay${num}`]: { ...(f as any)[`delay${num}`], j: +e.target.value },
                                }))
                              }
                              className="block w-16 border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs">Heures</label>
                            <input
                              type="number"
                              value={delay.h}
                              min={0}
                              max={23}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  [`delay${num}`]: { ...(f as any)[`delay${num}`], h: +e.target.value },
                                }))
                              }
                              className="block w-16 border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs">Minutes</label>
                            <input
                              type="number"
                              value={delay.m}
                              min={0}
                              max={59}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  [`delay${num}`]: { ...(f as any)[`delay${num}`], m: +e.target.value },
                                }))
                              }
                              className="block w-16 border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num + 10}>
                        <label className="block text-sm font-medium">Corps de l'email {num}</label>
                        <textarea
                          name={`email_template_${num}`}
                          value={(form as any)[`email_template_${num}`]}
                          onChange={handleInputChange}
                          className="mt-2 block w-full border-gray-300 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                        onClick={() => { setShowForm(false); setEditingId(null); }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      >
                        {editingId ? "Enregistrer" : "Créer"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-stretch gap-6 w-full">
              {profiles.map((profile) => (
                <div key={profile.id} className="bg-white shadow rounded-lg p-4 w-full sm:w-1/2 lg:w-1/3 flex flex-col gap-3">
                  <div>
                    <div className="text-lg font-bold flex items-center gap-2">
                      <span>{profile.name}</span>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      {Array.from({length: 4}).map((_, i) => (
                        <div key={i}>
                          <span className="font-semibold">Délais {i+1} :</span> {profile[`delay${i+1}`]?.j ?? 0}j {profile[`delay${i+1}`]?.h ?? 0}h {profile[`delay${i+1}`]?.m ?? 0}m<br />
                          <span className="font-semibold">Email {i+1} :</span> {(profile[`email_template_${i+1}`] || "").slice(0, 40)}{(profile[`email_template_${i+1}`] || "").length > 40 ? "..." : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
                      onClick={() => handleEdit(profile)}
                    >
                      Éditer
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                      onClick={() => handleDelete(profile.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}