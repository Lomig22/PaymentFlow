'use client';
import React, { useEffect, useRef, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Plus, MoreHorizontal, Copy, UserPlus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../../providers/supabase-provider";

export default function ReminderProfilesClient({ profiles }: { profiles: any[] }) {
    const [localProfiles, setLocalProfiles] = useState(profiles);
    const supabase = useSupabase();
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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const router = useRouter();
    const navigate = (page: string) => {
        router.push(page);
    };
    const menuRefs = useRef<Record<string, HTMLElement | null>>({});

    // Fermer le menu 3 points au clic en dehors ou sur Échap
    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (!openMenuId) return;
            const current = menuRefs.current[openMenuId];
            if (current && !current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleDocumentClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [openMenuId]);

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
            await supabase.from("reminder_profiles").update(dataToSave).eq("id", editingId);
            setLocalProfiles((prev) =>
                prev.map((p) => (p.id === editingId ? { ...p, ...dataToSave } : p))
            );
        } else {
            const { data, error } = await supabase.from("reminder_profiles").insert(dataToSave).select();
            if (!error && data) {
                console.log(data);
                setLocalProfiles((prev) => [...prev, data]);
            }
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
                        const { error } = await supabase.from("reminder_profiles").delete().eq("id", id);

                        if (error) {
                            // Si référence côté clients empêche la suppression, on délient puis on réessaie
                            await supabase.from("clients").update({ reminder_profile: null }).eq("reminder_profile", id);
                            await supabase.from("reminder_profiles").delete().eq("id", id);
                        }
                        setLocalProfiles(prev => prev.filter(p => p.id !== id));
                    },
                },
                {
                    label: "Non",
                    className: "no-button",
                },
            ],
        });
    }

    async function handleDuplicate(profile: any) {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const copy = {
                name: `${profile.name} (copie)`,
                delay1: profile.delay1,
                delay2: profile.delay2,
                delay3: profile.delay3,
                delay4: profile.delay4,
                email_template_1: profile.email_template_1 || "",
                email_template_2: profile.email_template_2 || "",
                email_template_3: profile.email_template_3 || "",
                email_template_4: profile.email_template_4 || "",
                owner_id: user.id,
                public: false,
            };

            const { data } = await supabase.from("reminder_profiles").insert(copy).select().single();
            setLocalProfiles(prev => [...prev, data]);
        } catch (e) {
            console.error("Erreur duplication profil:", e);
        }
    }

    function handleAssign(profile: any) {
        // Rediriger vers la page clients avec un paramètre pour activer le mode assignation
        navigate(`/clients?assignProfile=${profile.id}`);
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className=" ml-4 text-2xl font-bold text-gray-900">Profils de relance</h1>
                {!showForm && (
                    <div className="flex items-center gap-3">
                        <button
                            disabled={localProfiles.length >= 3}
                            onClick={() => {
                                if (localProfiles.length >= 3) return;
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
                            className={`flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${localProfiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Plus className="h-5 w-5" />
                            Créer un profil
                        </button>
                        {localProfiles.length >= 3 && (
                            <span className="text-xs text-gray-500">Limite de 3 profils atteinte.</span>
                        )}
                    </div>
                )}
            </div>
            <div className="max-w-2xl mx-auto">
                <div>
                    <div className="mb-4"></div>
                    {showForm && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
                            <div className="relative bg-white rounded-lg shadow-xl p-5 w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto text-sm">
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
                                    className="flex flex-col gap-3"
                                >
                                    <div className="p-0">
                                        <label className="block text-sm font-medium text-gray-800">Nom du profil</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleInputChange}
                                            placeholder="Saisir le nom du profil"
                                            className="mt-2 block w-full rounded-md px-2.5 py-1.5 bg-white border border-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                    {[1, 2, 3, 4].map((num) => {
                                        const delay = (form as any)[`delay${num}`] as any;
                                        return (
                                            <div key={num} className="p-0 flex flex-wrap gap-3 items-end">
                                                <div className="text-xs font-semibold text-gray-700">Relance {num}</div>
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
                                                        className="block w-16 rounded-md px-2 py-1 bg-gray-100 ring-1 ring-inset ring-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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
                                                        className="block w-16 rounded-md px-2 py-1 bg-white ring-1 ring-inset ring-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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
                                                        className="block w-16 rounded-md px-2 py-1 bg-white ring-1 ring-inset ring-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {[1, 2, 3, 4].map((num) => (
                                        <div key={num + 10} className="p-0">
                                            <label className="block text-sm font-medium text-gray-800 mb-1">Corps de l'email {num}</label>
                                            <textarea
                                                name={`email_template_${num}`}
                                                value={(form as any)[`email_template_${num}`]}
                                                onChange={handleInputChange}
                                                placeholder="Contenu de l’email (placeholders: {company}, {amount}, {invoice_number}, {due_date}, {days_late})"
                                                className="mt-2 block w-full rounded-md px-2.5 py-2 bg-gray-100 ring-1 ring-inset ring-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-mono"
                                                rows={4}
                                            />
                                        </div>
                                    ))}
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            onClick={() => { setShowForm(false); setEditingId(null); }}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                                        >
                                            {editingId ? "Enregistrer" : "Créer"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap items-stretch gap-6 w-full">
                        {localProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                className="bg-white shadow rounded-lg p-4 w-full sm:w-1/2 lg:w-1/3 flex flex-col gap-3 relative"
                            >
                                <div>
                                    <div className="text-lg font-bold flex items-center gap-2">
                                        <span>{profile.name}</span>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i}>
                                                <span className="font-semibold">Délais {i + 1} :</span> {profile[`delay${i + 1}`]?.j ?? 0}j {profile[`delay${i + 1}`]?.h ?? 0}h {profile[`delay${i + 1}`]?.m ?? 0}m
                                                <br />
                                                <span className="font-semibold">Email {i + 1} :</span> {(profile[`email_template_${i + 1}`] || "").slice(0, 40)}
                                                {(profile[`email_template_${i + 1}`] || "").length > 40 ? "..." : ""}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bouton menu 3 points */}
                                <div
                                    className="absolute top-2 right-2"
                                    ref={(el: HTMLDivElement | null) => {
                                        menuRefs.current[profile.id] = el;
                                    }}
                                >
                                    <button
                                        className="p-1.5 rounded hover:bg-gray-100"
                                        onClick={() =>
                                            setOpenMenuId((prev) => (prev === profile.id ? null : profile.id))
                                        }
                                        aria-label="Actions profil"
                                    >
                                        <MoreHorizontal className="h-5 w-5 text-gray-600" />
                                    </button>
                                    {openMenuId === profile.id && (
                                        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                            <button
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    handleEdit(profile);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" /> Éditer
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    handleDuplicate(profile);
                                                }}
                                            >
                                                <Copy className="h-4 w-4" /> Dupliquer
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    handleAssign(profile);
                                                }}
                                            >
                                                <UserPlus className="h-4 w-4" /> Assigner
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    handleDelete(profile.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" /> Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}