import React, { useEffect, useState } from "react";
import { ReminderProfile } from "../../types/database";
import { AlertCircle, Save, Pencil } from "lucide-react";
import { supabase } from "../../lib/supabase";
import DelayInputJHM from "./DelayInputJHM";
import { Disclosure } from "@headlessui/react"; // v2.2.7 supports Disclosure as named import
import { ChevronUp } from "lucide-react";

type ProfileKey = "profile1" | "profile2" | "profile3";
type DelayKey = "delay1" | "delay2" | "delay3" | "delay4";
type DelayValue = { j: number; h: number; m: number };

type ReminderProfileSettingsProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

const ReminderProfileSettings: React.FC<ReminderProfileSettingsProps> = ({ onDirtyChange }) => {
  const [dirty, setDirty] = useState(false);
const [profileNames, setProfileNames] = useState({
    profile1: "Profil 1",
    profile2: "Profil 2",
    profile3: "Profil 3",
  });
  const [editingProfile, setEditingProfile] = useState<null | string>(null);
  const [editingValue, setEditingValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Whenever dirty changes, notify parent
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  const [saving, setSaving] = useState(false);
  type ReminderProfileForm = {
  id?: string;
  delay1: DelayValue;
  delay2: DelayValue;
  delay3: DelayValue;
  delay4: DelayValue;
  email_template_1?: string;
  email_template_2?: string;
  email_template_3?: string;
  email_template_4?: string;
};

const [formData, setFormData] = useState<{
  profile1: ReminderProfileForm;
  profile2: ReminderProfileForm;
  profile3: ReminderProfileForm;
}>({
  profile1: {
    id: undefined,
    delay1: { j: 0, h: 0, m: 0 },
    delay2: { j: 0, h: 0, m: 0 },
    delay3: { j: 0, h: 0, m: 0 },
    delay4: { j: 0, h: 0, m: 0 },
    email_template_1: '',
    email_template_2: '',
    email_template_3: '',
    email_template_4: '',
  },
  profile2: {
    id: undefined,
    delay1: { j: 0, h: 0, m: 0 },
    delay2: { j: 0, h: 0, m: 0 },
    delay3: { j: 0, h: 0, m: 0 },
    delay4: { j: 0, h: 0, m: 0 },
    email_template_1: '',
    email_template_2: '',
    email_template_3: '',
    email_template_4: '',
  },
  profile3: {
    id: undefined,
    delay1: { j: 0, h: 0, m: 0 },
    delay2: { j: 0, h: 0, m: 0 },
    delay3: { j: 0, h: 0, m: 0 },
    delay4: { j: 0, h: 0, m: 0 },
    email_template_1: '',
    email_template_2: '',
    email_template_3: '',
    email_template_4: '',
  }
});

  // Fonction pour renommer un profil
  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  const handleProfileRename = async (profileKey: ProfileKey, newName: string) => {
    setProfileNames((prev) => ({ ...prev, [profileKey]: newName }));
    markDirty();
    // Persistance dans Supabase
    const profileId = formData[profileKey].id;
    if (!profileId) return;
    await supabase
      .from("reminder_profile")
      .update({ name: newName })
      .eq("id", profileId);
  };

  // Chargement initial des noms personnalisés
  const fetchAndSetProfiles = async () => {
    setSaving(true);
    // Get user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user || userError) {
      setError("Utilisateur non authentifié");
      setSaving(false);
      return;
    }
    setUserId(user.id);
    // Fetch profiles for this user
    const { data: profiles, error } = await supabase
      .from("reminder_profile")
      .select("id, name, delay1, delay2, delay3, delay4, email_template_1, email_template_2, email_template_3, email_template_4")
      .eq("owner_id", user.id)
      .order("id", { ascending: true });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    if (!profiles || profiles.length < 3) {
      setError("Profils de rappel manquants ou incomplets");
      setSaving(false);
      return;
    }
    setFormData({
      profile1: {
        id: profiles[0].id,
        delay1: profiles[0].delay1 ?? 0,
        delay2: profiles[0].delay2 ?? 0,
        delay3: profiles[0].delay3 ?? 0,
        delay4: profiles[0].delay4 ?? 0,
        email_template_1: profiles[0].email_template_1 || '',
        email_template_2: profiles[0].email_template_2 || '',
        email_template_3: profiles[0].email_template_3 || '',
        email_template_4: profiles[0].email_template_4 || '',
      },
      profile2: {
        id: profiles[1].id,
        delay1: profiles[1].delay1 ?? 0,
        delay2: profiles[1].delay2 ?? 0,
        delay3: profiles[1].delay3 ?? 0,
        delay4: profiles[1].delay4 ?? 0,
        email_template_1: profiles[1].email_template_1 || '',
        email_template_2: profiles[1].email_template_2 || '',
        email_template_3: profiles[1].email_template_3 || '',
        email_template_4: profiles[1].email_template_4 || '',
      },
      profile3: {
        id: profiles[2].id,
        delay1: profiles[2].delay1 ?? 0,
        delay2: profiles[2].delay2 ?? 0,
        delay3: profiles[2].delay3 ?? 0,
        delay4: profiles[2].delay4 ?? 0,
        email_template_1: profiles[2].email_template_1 || '',
        email_template_2: profiles[2].email_template_2 || '',
        email_template_3: profiles[2].email_template_3 || '',
        email_template_4: profiles[2].email_template_4 || '',
      },
    });
    setProfileNames({
      profile1: profiles[0].name || "Profil 1",
      profile2: profiles[1].name || "Profil 2",
      profile3: profiles[2].name || "Profil 3",
    });
    setSaving(false);
  };

  useEffect(() => {
    fetchAndSetProfiles();
  }, []);

  const handleInputOnBlur = (
    profile: ProfileKey,
    delay: DelayKey,
    value: DelayValue
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [profile]: {
        ...prevFormData[profile],
        [delay]: value,
      },
    }));
    markDirty();
  };

  const handleDelayChange = (profileKey: ProfileKey, delayKey: DelayKey, value: DelayValue) => {
    setFormData((prev) => ({
      ...prev,
      [profileKey]: {
        ...prev[profileKey],
        [delayKey]: value,
      },
    }));
    markDirty();
  };

  type TemplateKey = `email_template_${1|2|3|4}`;
const handleTemplateChange = (profileKey: ProfileKey, templateKey: TemplateKey, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [profileKey]: {
        ...prev[profileKey],
        [templateKey]: value,
      },
    }));
    markDirty();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (userId === null) return;
    if (formData.profile1.id === undefined) {
      const prepareData: ReminderProfile[] = [
        {
          name: profileNames.profile1,
          delay1: formData.profile1.delay1,
          delay2: formData.profile1.delay2,
          delay3: formData.profile1.delay3,
          delay4: formData.profile1.delay4,
          owner_id: userId,
          public: false,
          email_template_1: formData.profile1.email_template_1,
          email_template_2: formData.profile1.email_template_2,
          email_template_3: formData.profile1.email_template_3,
          email_template_4: formData.profile1.email_template_4,
        },
        {
          name: profileNames.profile2,
          delay1: formData.profile2.delay1,
          delay2: formData.profile2.delay2,
          delay3: formData.profile2.delay3,
          delay4: formData.profile2.delay4,
          owner_id: userId,
          public: false,
          email_template_1: formData.profile2.email_template_1,
          email_template_2: formData.profile2.email_template_2,
          email_template_3: formData.profile2.email_template_3,
          email_template_4: formData.profile2.email_template_4,
        },
        {
          name: profileNames.profile3,
          delay1: formData.profile3.delay1,
          delay2: formData.profile3.delay2,
          delay3: formData.profile3.delay3,
          delay4: formData.profile3.delay4,
          owner_id: userId,
          public: false,
          email_template_1: formData.profile3.email_template_1,
          email_template_2: formData.profile3.email_template_2,
          email_template_3: formData.profile3.email_template_3,
          email_template_4: formData.profile3.email_template_4,
        },
      ];
      const { error } = await supabase
        .from("reminder_profile")
        .insert(prepareData);
      if (error) {
        setError(error.message);
      }
    } else {
      const prepareData: ReminderProfile[] = [
        {
          id: formData.profile1.id,
          name: profileNames.profile1,
          delay1: formData.profile1.delay1,
          delay2: formData.profile1.delay2,
          delay3: formData.profile1.delay3,
          delay4: formData.profile1.delay4,
          owner_id: userId,
          public: false,
          email_template_1: formData.profile1.email_template_1,
          email_template_2: formData.profile1.email_template_2,
          email_template_3: formData.profile1.email_template_3,
          email_template_4: formData.profile1.email_template_4,
        },
        {
          id: formData.profile2.id,
          name: profileNames.profile2,
          delay1: formData.profile2.delay1,
          delay2: formData.profile2.delay2,
          delay3: formData.profile2.delay3,
          delay4: formData.profile2.delay4,
          owner_id: userId,
          public: false,
          email_template_1: formData.profile2.email_template_1,
          email_template_2: formData.profile2.email_template_2,
          email_template_3: formData.profile2.email_template_3,
          email_template_4: formData.profile2.email_template_4,
        },
        {
          id: formData.profile3.id,
          name: profileNames.profile3,
          delay1: formData.profile3.delay1,
          delay2: formData.profile3.delay2,
          delay3: formData.profile3.delay3,
          delay4: formData.profile3.delay4,
          owner_id: userId,
          public: false,
          email_template_1: formData.profile3.email_template_1,
          email_template_2: formData.profile3.email_template_2,
          email_template_3: formData.profile3.email_template_3,
          email_template_4: formData.profile3.email_template_4,
        },
      ];
      const { error: error1 } = await supabase
        .from("reminder_profile")
        .update(prepareData[0])
        .eq("id", prepareData[0].id);

      const { error: error2 } = await supabase
        .from("reminder_profile")
        .update(prepareData[1])
        .eq("id", prepareData[1].id);

      const { error: error3 } = await supabase
        .from("reminder_profile")
        .update(prepareData[2])
        .eq("id", prepareData[2].id);
      if (error1) {
        setError(error1.message);
        return;
      }
      if (error2) {
        setError(error2?.message);
        return;
      }
      if (error3) {
        setError(error3?.message);
        return;
      }
      setSuccess(true);
      setDirty(false); // Reset dirty after save
      if (onDirtyChange) onDirtyChange(false);
      setTimeout(() => setSuccess(false), 3000);
    }
    await fetchAndSetProfiles();
    setSaving(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Profil utilisateur</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Profil de rappel mis à jour avec succès
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <span className="text-blue-800 font-semibold block mb-1">Note :</span>
        <span className="text-blue-700 text-sm">
          Le délai est l'écart entre chaque relance, et non le temps écoulé depuis l'échéance de la facture.
        </span>
      </div>
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <span className="text-yellow-800 font-semibold block mb-1">Attention :</span>
        <span className="text-yellow-700 text-sm">
          Les espaces ne sont pas autorisés dans le nom du profil.
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[1, 2, 3].map((n) => (
          <Disclosure key={n}>
            {({ open }: { open: boolean }) => (
              <div className="border rounded-md">
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-left text-sm font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-t-md">
                  {editingProfile === `profile${n}` ? (
                    <input
                      type="text"
                      className="border-b border-blue-500 bg-transparent text-blue-900 font-semibold w-32 mr-2 focus:outline-none"
                      value={editingValue}
                      autoFocus
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={async () => {
                        await handleProfileRename(`profile${n}` as ProfileKey, editingValue);
                        setEditingProfile(null);
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await handleProfileRename(`profile${n}` as ProfileKey, editingValue);
                          setEditingProfile(null);
                        }
                      }}
                    />
                  ) : (
                    <>
                      <span className="flex items-center gap-1">
                        {profileNames[`profile${n}` as ProfileKey]}
                        <button
                          type="button"
                          aria-label="Renommer le profil"
                          className="text-blue-700 hover:text-blue-900 p-0.5"
                          style={{ marginLeft: 0 }}
                          onClick={() => {
                            setEditingProfile(`profile${n}`);
                            setEditingValue(profileNames[`profile${n}` as ProfileKey]);
                          }}
                        >
                          <Pencil className="inline h-4 w-4" />
                        </button>
                      </span>
                      <ChevronUp
                        className={`h-5 w-5 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700">
                  <div className="grid grid-cols-5 gap-6 items-center">
                    {["delay1", "delay2", "delay3", "delay4"].map((delayKey, idx) => (
                      <DelayInputJHM
                        key={delayKey}
                        value={formData[`profile${n}` as ProfileKey][delayKey as DelayKey]}
                        onChange={(value) => handleInputOnBlur(`profile${n}` as ProfileKey, delayKey as DelayKey, value)}
                        label={`Relance ${idx + 1}`}
                        disabled={saving}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 mt-6">
                    {[1, 2, 3, 4].map((templateIdx) => (
                      <div key={templateIdx}>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Modèle d'email pour la relance {templateIdx}
                        </label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          value={(formData[`profile${n}` as ProfileKey] as any)[`email_template_${templateIdx}`] || ''}
                          onChange={(e) => handleTemplateChange(
                            `profile${n}` as ProfileKey,
                            `email_template_${templateIdx}` as TemplateKey,
                            e.target.value
                          )}
                          placeholder={`Saisissez ici le texte de l'email pour la relance ${templateIdx}`}
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

// @ts-ignore
// import { Disclosure } from '@headlessui/react'; // commented out for now, please check if package is installed

export default ReminderProfileSettings;
