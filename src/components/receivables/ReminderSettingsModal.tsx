import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { saveNotification } from "../../lib/notification";
import { Client, Receivable, ReminderProfile } from "../../types/database";
import { X, AlertCircle, Play, Pause } from "lucide-react";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import "react-datetime/css/react-datetime.css"; // si tu n'as pas encore importé le style
import DateTimeInput from "../Common/DateTimeInput";
import { isBefore, startOfMinute } from "date-fns";
import Swal from "sweetalert2";
import ReminderInfo from "./reminderInfo";

interface ReminderSettingsModalProps {
  client: Client;
  onClose: () => void;
  reminderProfiles: ReminderProfile[];
  receivable: Receivable;
  open: boolean;
}

export default function ReminderSettingsModal({
  client,
  onClose,
  receivable,
  reminderProfiles,
}: ReminderSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showReminders, setShowReminders] = useState(true);
  const [automaticReminder, setAutomaticReminder] = useState<boolean>(
    receivable.automatic_reminder ?? false
  );

  // Récupérer le profil de rappel associé au client
  const reminderProfile = reminderProfiles.find(
    (p) => p.id === client.reminder_profile
  );

  // État local pour les templates d'email
  const [emailTemplates, setEmailTemplates] = useState({
    email_template_1: reminderProfile?.email_template_1 || "",
    email_template_2: reminderProfile?.email_template_2 || "",
    email_template_3: reminderProfile?.email_template_3 || "",
    email_template_4: reminderProfile?.email_template_4 || "",
  });

  // Synchroniser l'état local si le profil change ou à chaque ouverture de la modale
  useEffect(() => {
    if (reminderProfile && !!open) {
      setEmailTemplates({
        email_template_1: reminderProfile.email_template_1 || "",
        email_template_2: reminderProfile.email_template_2 || "",
        email_template_3: reminderProfile.email_template_3 || "",
        email_template_4: reminderProfile.email_template_4 || "",
      });
    }
  }, [reminderProfile, open]);

  const handleTemplateChange = (key: keyof typeof emailTemplates, value: string) => {
    setEmailTemplates((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveTemplates = async () => {
    if (!reminderProfile?.id) return;
    setLoading(true);
    const { error } = await supabase
      .from("reminder_profile")
      .update(emailTemplates)
      .eq("id", reminderProfile.id);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  // Valeurs par défaut des délais (si non fournis)
  const delay1 = client.reminder_delay_1 || { j: 1, h: 0, m: 0 };
  const delay2 = client.reminder_delay_2 || { j: 1, h: 0, m: 0 };
  const delay3 = client.reminder_delay_3 || { j: 1, h: 0, m: 0 };
  const delayFinal = client.reminder_delay_final || { j: 1, h: 0, m: 0 };

  // Calcul des dates à partir des délais
  const reminder_date_1 =
    client.reminder_date_1 ?? addJHMToDate(new Date().toISOString(), delay1);
  const reminder_date_2 =
    client.reminder_date_2 ?? addJHMToDate(reminder_date_1, delay2);
  const reminder_date_3 =
    client.reminder_date_3 ?? addJHMToDate(reminder_date_2, delay3);
  const reminder_date_final =
    client.reminder_date_final ?? addJHMToDate(reminder_date_3, delayFinal);
  const pre_reminder_date =
    client.pre_reminder_date ?? new Date().toISOString();


  // Initialisation du formData
  const [formData, setFormData] = useState({
    reminder_delay_1: delay1,
    reminder_delay_2: delay2,
    reminder_delay_3: delay3,
    reminder_delay_final: delayFinal,

    reminder_template_1: reminderProfile?.email_template_1 || client.reminder_template_1 || "",
    reminder_template_2: reminderProfile?.email_template_2 || client.reminder_template_2 || "",
    reminder_template_3: reminderProfile?.email_template_3 || client.reminder_template_3 || "",
    reminder_template_final: reminderProfile?.email_template_4 || client.reminder_template_final || "",

    reminder_enable_1: client.reminder_profile
      ? true
      : client.reminder_enable_1,
    reminder_enable_2: client.reminder_profile
      ? true
      : client.reminder_enable_2,
    reminder_enable_3: client.reminder_profile
      ? true
      : client.reminder_enable_3,
    reminder_enable_final: client.reminder_profile
      ? true
      : client.reminder_enable_final,
    pre_reminder_enable: client.pre_reminder_enable,

    reminder_profile: client.reminder_profile || null,

    reminder_date_1,
    reminder_date_2,
    reminder_date_3,
    reminder_date_final,
    pre_reminder_date,

    pre_reminder_delay: client.pre_reminder_delay || { j: 0, h: 0, m: 0 },
    pre_reminder_template: client.pre_reminder_template || "",
  });

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  function addJHMToDate(
    dateIsoString: string,
    jhm?: { j?: number; h?: number; m?: number }
  ): string {
    const { j = 0, h = 0, m = 0 } = jhm ?? {};
    const baseDate = new Date(dateIsoString);

    const totalMs = ((j * 24 + h) * 60 + m) * 60 * 1000;
    const newDate = new Date(baseDate.getTime() + totalMs);

    return newDate.toISOString();
  }

  // Gestion de la touche Echap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Désactiver le défilement du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const [hasPastDateEnable, setHasPastDateEnable] = useState(false);
  const [reminder1AlreadySend, setReminder1AlreadySend] = useState(false);
  const [reminder2AlreadySend, setReminder2AlreadySend] = useState(false);
  const [reminder3AlreadySend, setReminder3AlreadySend] = useState(false);
  const [reminderFinalAlreadySend, setReminderFinalAlreadySend] =
    useState(false);
    const [reminderProfileName,setReminderProfileName]=useState('')
  const [preAlreadySend, setPreAlreadySend] = useState(false);
  useEffect(() => {
    const checkReminders = async () => {
      const now = startOfMinute(new Date()); // tronque à la minute près

      const alreadySend = async (reminderType: string) => {
        const { data, error } = await supabase
          .from("reminders")
          .select("id")
          .eq("receivable_id", receivable.id)
          .eq("reminder_type", reminderType)
          .limit(1);

        if (error) {
          console.error("Erreur Supabase :", error);
          return false;
        }

        return data.length > 0;
      };

      const pre_already_send = await alreadySend("pre");
      const reminder_1_already_send = await alreadySend("first");
      const reminder_2_already_send = await alreadySend("second");
      const reminder_3_already_send = await alreadySend("third");
      const reminder_final_already_send = await alreadySend("final");
      setPreAlreadySend(pre_already_send);
      setReminder1AlreadySend(reminder_1_already_send);
      setReminder2AlreadySend(reminder_2_already_send);
      setReminder3AlreadySend(reminder_3_already_send);
      setReminderFinalAlreadySend(reminder_final_already_send);
      const {
        reminder_date_1: firstReminderDate,
        reminder_date_2: secondReminderDate,
        reminder_date_3: thirdReminderDate,
        reminder_date_final: finalReminderDate,
        pre_reminder_date: preReminderDate,
        reminder_enable_1,
        reminder_enable_2,
        reminder_enable_3,
        reminder_enable_final,
        pre_reminder_enable,
      } = formData;

      const isTherePastDate = [
        reminder_enable_1 &&
          reminder_1_already_send === false &&
          firstReminderDate,
        reminder_enable_2 &&
          reminder_2_already_send === false &&
          secondReminderDate,
        reminder_enable_3 &&
          reminder_3_already_send === false &&
          thirdReminderDate,
        reminder_enable_final &&
          reminder_final_already_send === false &&
          finalReminderDate,
        pre_reminder_enable && pre_already_send === false && preReminderDate,
      ].some((date) => date && isBefore(startOfMinute(new Date(date)), now));

      setHasPastDateEnable(isTherePastDate);
    };

    checkReminders();
  }, [formData, receivable.id]);
  useEffect(() => {
    const fetchReminderProfileName = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
  
      if (userError || !user) {
        console.error('Erreur lors de la récupération de l’utilisateur', userError);
        return;
      }
      if (!client.reminder_profile) return
      const { data: reminderProfile, error } = await supabase
        .from('reminder_profile')
        .select('name')
        .eq('id', client.reminder_profile)
        .single(); // pour récupérer un seul objet au lieu d'un tableau
  
      if (error) {
        console.error("Erreur récupération de reminder_profile :", error);
        return;
      }
  
      setReminderProfileName(reminderProfile.name);
    };
  
    fetchReminderProfileName();
  }, [client.id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const {
      pre_reminder_enable,
      reminder_enable_1,
      reminder_enable_2,
      reminder_enable_3,
      reminder_enable_final,
    } = formData;

    // Vérification de l'ordre des dates
    const {
      pre_reminder_date,
      reminder_date_1,
      reminder_date_2,
      reminder_date_3,
      reminder_date_final,
    } = formData;

    // Construire dynamiquement la liste des dates activées
    const dates = [];

    if (pre_reminder_enable) {
      dates.push({ label: "Prérelance", date: new Date(pre_reminder_date) });
    }
    if (reminder_enable_1) {
      dates.push({ label: "Relance 1", date: new Date(reminder_date_1) });
    }
    if (reminder_enable_2) {
      dates.push({ label: "Relance 2", date: new Date(reminder_date_2) });
    }
    if (reminder_enable_3) {
      dates.push({ label: "Relance 3", date: new Date(reminder_date_3) });
    }
    if (reminder_enable_final) {
      dates.push({
        label: "Relance finale",
        date: new Date(reminder_date_final),
      });
    }

    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i].date >= dates[i + 1].date) {
        showError(
          `La date de "${dates[i].label}" doit être avant la date de "${
            dates[i + 1].label
          }".`
        );
        setLoading(false);
        return;
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      // Supposons que "alreadySent" est un tableau contenant les relances déjà envoyées
      if (
        receivable.status !== "pending" ||
        preAlreadySend ||
        reminder1AlreadySend ||
        reminder2AlreadySend ||
        reminder3AlreadySend ||
        reminderFinalAlreadySend
      ) {
        const result = await Swal.fire({
          title: "Modification du process",
          text: "Modifier les paramètres réinitialisera le processus!\n Il est conseillé de décocher les relances non souhaitées",
          showCancelButton: true,
          confirmButtonText: "Continuer",
          cancelButtonText: "Annuler",
          customClass: {
            confirmButton:
              "bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded mr-2",
            cancelButton:
              "px-4 py-2 rounded text-white border bg-blue-600 border-gray-300",
          },
          buttonsStyling: false,
        });

        if (result.isConfirmed) {
          // Supprimer les rappels
          const { error: deleteError } = await supabase
            .from("reminders")
            .delete()
            .eq("receivable_id", receivable.id);

          if (deleteError) throw deleteError;

          // Mettre à jour le receivable
          const { error: updateError } = await supabase
            .from("receivables")
            .update({
              automatic_reminder: false,
              status: "pending",
            })
            .eq("id", receivable.id);

          if (updateError) throw updateError;
        } else {
          setLoading(false);
          return;
        }
      }
      if (hasPastDateEnable) {
        showError(
          "Des dates de relance antérieures sont activés. Veuillez les corriger !"
        );
        return;
      }

      const { error: updateError } = await supabase
        .from("clients")
        .update({
          reminder_delay_1: formData.reminder_delay_1,
          reminder_delay_2: formData.reminder_delay_2,
          reminder_delay_3: formData.reminder_delay_3,
          reminder_delay_final: formData.reminder_delay_final,
          reminder_template_1: formData.reminder_template_1.trim(),
          reminder_template_2: formData.reminder_template_2.trim(),
          reminder_template_3: formData.reminder_template_3.trim(),
          reminder_template_final: formData.reminder_template_final.trim(),
          pre_reminder_enable: formData.pre_reminder_enable,
          reminder_enable_1: formData.reminder_enable_1,
          reminder_enable_2: formData.reminder_enable_2,
          reminder_enable_3: formData.reminder_enable_3,
          reminder_enable_final: formData.reminder_enable_final,
          reminder_date_1: formData.reminder_date_1,
          reminder_date_2: formData.reminder_date_2,
          reminder_date_3: formData.reminder_date_3,
          reminder_date_final: formData.reminder_date_final,
          pre_reminder_date: formData.pre_reminder_date,
          reminder_profile: formData.reminder_profile,
          pre_reminder_delay: formData.pre_reminder_delay,
          pre_reminder_template: formData.pre_reminder_template,
        })
        .eq("id", client.id);
      if (user?.id) {
        const details = JSON.stringify(
          {
            "Numéro de facture": `${receivable.invoice_number}`,
            "Délai de relance 1": `${formData.reminder_delay_1.j || 1}:${
              formData.reminder_delay_1.h || 0
            }:${formData.reminder_delay_1.m || 0} `,
            "Délai de relance 2": `${formData.reminder_delay_2.j || 1}:${
              formData.reminder_delay_2.h || 0
            }:${formData.reminder_delay_2.m || 0} `,
            "Délai de relance 3": `${formData.reminder_delay_3.j || 1}:${
              formData.reminder_delay_3.h || 0
            }:${formData.reminder_delay_3.m || 0} `,
            "Délai de relance finale": `${
              formData.reminder_delay_final.j || 1
            }:${formData.reminder_delay_final.h || 0}:${
              formData.reminder_delay_final.m || 0
            } `,
            "Template de la relance 1": formData.reminder_template_1.trim(),
            "Template de la relance 2": formData.reminder_template_2.trim(),
            "Template de la relance 3": formData.reminder_template_3.trim(),
            "Template de la relance finale":
              formData.reminder_template_final.trim(),
            "Profil de relance": formData.reminder_profile,
            "Délai de prérelance": `${formData.pre_reminder_delay}`,
            "Template de la prérelance": formData.pre_reminder_template.trim(),
          },
          null,
          2
        );
        try {
          await saveNotification({
            owner_id: user.id,
            need_mail_notification: true,
            is_read: false,
            type: "info",
            message: "Mises à jour des paramètres de relance",
            details: details,
          });
        } catch (error: any) {
          showError(error);
        }
      }
      if (updateError) throw updateError;

      setSuccess(true);
      // Attendre un peu avant de fermer pour montrer le message de succès
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      showError(
        "Impossible de mettre à jour les paramètres, vérifier le profil du client!"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTemplateExample = (step: number) => {
    const examples = {
      1: `Cher client,\n\nNous n'avons pas encore reçu le paiement de la facture {invoice_number} d'un montant de {amount}, échue depuis {days_late} jours.\n\nMerci de régulariser la situation dans les plus brefs délais.`,
      2: `Cher client,\n\nMalgré notre première relance, la facture {invoice_number} d'un montant de {amount} reste impayée.\n\nNous vous prions de procéder au règlement sous 48h.`,
      3: `Cher client,\n\nLa facture {invoice_number} d'un montant de {amount} est toujours en attente de règlement malgré nos relances.\n\nSans paiement de votre part sous 72h, nous serons contraints d'engager une procédure de recouvrement.`,
      4: `Cher client,\n\nCeci est notre dernière relance concernant la facture {invoice_number} d'un montant de {amount}.\n\nSans règlement immédiat, nous transmettrons le dossier à notre service contentieux.`,
      5: `Cher client,\n\n nous n'avons pas encore reçu le paiement de la facture n° {invoice_number}, soit {amount}. Nous vous informons que vous disposez de {days_left} jours avant la date limite.\n\nMerci de régulariser la situation dans les plus brefs délais.`,
    };
    return examples[step as keyof typeof examples] || "";
  };

  //Bouton Play/Pause
  const handleAutomaticReminderToggle = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {
      setLoading(true);
      setError(null);

      // Update the receivable
      const { error } = await supabase
        .from("receivables")
        .update({
          automatic_reminder: !receivable.automatic_reminder,
        })
        .eq("id", receivable.id);
      if (error) throw error;
      await saveNotification({
        owner_id: user?.id ?? null,
        need_mail_notification: true,
        is_read: false,
        type: "info",
        message: "Mise à jour des paramètres de relance automatique",
        details: automaticReminder
          ? `Les relances sont activés pour la relance ${receivable?.invoice_number}`
          : `Les relances sont en pause pour la relance ${receivable?.invoice_number}`,
      });

      setAutomaticReminder((prevState) => !prevState);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      if (user?.id) {
        await saveNotification({
          owner_id: user?.id ?? null,
          is_read: false,
          need_mail_notification: true,
          type: "erreur",
          message: "Mise à jour des paramètres de relance automatique échouée",
          details: typeof error?.message === 'string' ? error.message : error ? String(error) : null,
        });
      }
      showError(error?.message ?? "Impossible de mettre à jour les paramètres");
    } finally {
      setLoading(false);
    }
  };

  const dueDate = new Date(receivable.due_date);
  dueDate.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
        <div className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-2xl font-semibold text-gray-800">
              <span>Paramètres de relance</span>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <p className="text-gray-600 mb-6">Client : {client.company_name}</p>
            <div
              title="Stop sending automatic reminders"
              onClick={handleAutomaticReminderToggle}
            >
              {automaticReminder ? (
                <Pause
                  className="cursor-pointer hover:fill-blue-400 stroke-blue-400"
                  strokeWidth={2}
                />
              ) : (
                <Play
                  className="cursor-pointer hover:fill-blue-400 stroke-blue-400"
                  strokeWidth={2}
                />
              )}
            </div>
          </form>
          {!client.reminder_profile && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-800 font-medium mb-2">Information:</p>
              <p className="text-blue-700 text-sm">
                Aucun profil défini pour cette relance, veuillez configurer
                manuellement chaque date!
              </p>
            </div>
          )}
          <ReminderInfo client={client} reminderProfileName={reminderProfileName}/>
          {/*            {hasPastDateEnable && (
            <div className=" mb-4 p-4 border border-yellow-400 bg-yellow-100 text-yellow-800 rounded">
              Certaines dates de relance sont antérieures à la date actuelle
            </div>
          )}  */}
          {error && (
            <div className="fixed top-0 left-1/2 -translate-x-1/2  mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center z-[51]">
              {error}
            </div>
          )}

          {success && (
            <div className="fixed top-0 left-1/2 -translate-x-1/2 mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 z-[51]">
              Paramètres sauvegardés avec succès
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative  min-h-[124px]">
                <DateTimeInput
                  label="Date/Heure d’envoi – Pré-relance"
                  value={new Date(formData.pre_reminder_date)}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      pre_reminder_date: date.toISOString(),
                    })
                  }
                  optional={formData.pre_reminder_enable}
                  onToggleOptional={(checked) =>
                    setFormData({
                      ...formData,
                      pre_reminder_enable: checked,
                    })
                  }
                />

                {preAlreadySend && (
                  <span className="absolute top-0 right-0 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Déjà envoyée
                  </span>
                )}
              </div>
            </div>
            <div className="border rounded-lg shadow p-4">
              <button
                type="button"
                className="w-full flex justify-between items-center text-left font-semibold text-gray-800"
                onClick={() => setShowReminders(!showReminders)}
              >
                <span>Paramétrages des relances</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    showReminders ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showReminders && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Relance 1 */}
                  <div className="relative min-h-[124px]">
                    <DateTimeInput
                      label="Date/Heure d’envoi – Première relance"
                      value={new Date(formData.reminder_date_1)}
                      onChange={(date) => {
                        client.reminder_profile
                          ? setFormData({
                              ...formData,
                              reminder_date_1: date.toISOString(),
                              reminder_date_2: addJHMToDate(
                                date.toISOString(),
                                client.reminder_delay_2
                              ),
                              reminder_date_3: addJHMToDate(
                                addJHMToDate(
                                  date.toISOString(),
                                  client.reminder_delay_2
                                ),
                                client.reminder_delay_3
                              ),
                              reminder_date_final: addJHMToDate(
                                addJHMToDate(
                                  addJHMToDate(
                                    date.toISOString(),
                                    client.reminder_delay_2
                                  ),
                                  client.reminder_delay_3
                                ),
                                client.reminder_delay_final
                              ),
                            })
                          : setFormData({
                              ...formData,
                              reminder_date_1: date.toISOString(),
                            });
                      }}
                      optional={formData.reminder_enable_1}
                      onToggleOptional={(checked) =>
                        setFormData({ ...formData, reminder_enable_1: checked })
                      }
                    />
                    {reminder1AlreadySend && (
                      <span className="absolute top-0 right-0 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Déjà envoyée
                      </span>
                    )}
                  </div>

                  {/* Relance 2 */}
                  <div className="relative min-h-[124px]">
                    <fieldset
                      // disabled={client.reminder_profile}
                      className={client.reminder_profile ? "opacity-50" : ""}
                    >
                      <DateTimeInput
                        label="Date/Heure d’envoi – Deuxième relance"
                        value={new Date(formData.reminder_date_2)}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            reminder_date_2: date.toISOString(),
                          })
                        }
                        optional={formData.reminder_enable_2}
                        onToggleOptional={(checked) =>
                          setFormData({
                            ...formData,
                            reminder_enable_2: checked,
                          })
                        }
                      />
                      {reminder2AlreadySend && (
                        <span className="absolute top-0 right-0 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Déjà envoyée
                        </span>
                      )}
                    </fieldset>
                  </div>

                  {/* Relance 3 */}
                  <div className="relative min-h-[124px]">
                    <fieldset
                      // disabled={client.reminder_profile}
                      className={client.reminder_profile ? "opacity-50" : ""}
                    >
                      <DateTimeInput
                        label="Date/Heure d’envoi – Troisième relance"
                        value={new Date(formData.reminder_date_3)}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            reminder_date_3: date.toISOString(),
                          })
                        }
                        optional={formData.reminder_enable_3}
                        onToggleOptional={(checked) =>
                          setFormData({
                            ...formData,
                            reminder_enable_3: checked,
                          })
                        }
                      />
                      {reminder3AlreadySend && (
                        <span className="absolute top-0 right-0 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Déjà envoyée
                        </span>
                      )}
                    </fieldset>
                  </div>

                  {/* Relance finale */}
                  <div className="relative min-h-[124px]">
                    <fieldset
                      // disabled={client.reminder_profile}
                      className={client.reminder_profile ? "opacity-50" : ""}
                    >
                      <DateTimeInput
                        label="Date/Heure d’envoi – Relance finale"
                        value={new Date(formData.reminder_date_final)}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            reminder_date_final: date.toISOString(),
                          })
                        }
                        optional={formData.reminder_enable_final}
                        onToggleOptional={(checked) =>
                          setFormData({
                            ...formData,
                            reminder_enable_final: checked,
                          })
                        }
                      />
                      {reminderFinalAlreadySend && (
                        <span className="absolute top-0 right-0 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Déjà envoyée
                        </span>
                      )}
                    </fieldset>
                  </div>
                </div>
              )}
            </div>
            {/*end relance en calendrier */}
            {/* accordéon*/}
            {formData.pre_reminder_enable && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Pré relance
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={formData.pre_reminder_template}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pre_reminder_template: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          pre_reminder_template: getTemplateExample(5),
                        })
                      }
                      className="absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Utiliser un exemple
                    </button>
                  </div>
                </div>
              </div>
            )}

            {formData.reminder_enable_1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template première relance
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={formData.reminder_template_1 ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminder_template_1: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        reminder_template_1: getTemplateExample(1),
                      })
                    }
                    className="absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Utiliser un exemple
                  </button>
                </div>
              </div>
            )}
            {formData.reminder_enable_2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template deuxième relance
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={formData.reminder_template_2 ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminder_template_2: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        reminder_template_2: getTemplateExample(2),
                      })
                    }
                    className="absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Utiliser un exemple
                  </button>
                </div>
              </div>
            )}
            {formData.reminder_enable_3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template troisième relance
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={formData.reminder_template_3 ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminder_template_3: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        reminder_template_3: getTemplateExample(3),
                      })
                    }
                    className="absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Utiliser un exemple
                  </button>
                </div>
              </div>
            )}
            {formData.reminder_enable_final && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template relance finale
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={formData.reminder_template_final ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminder_template_final: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Utilisez {company}, {amount}, {invoice_number}, {due_date}, {days_late} comme variables"
                  ></textarea>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        reminder_template_final: getTemplateExample(4),
                      })
                    }
                    className="absolute right-2 bottom-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Utiliser un exemple
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-between space-x-4">
              <div className="w-full flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
