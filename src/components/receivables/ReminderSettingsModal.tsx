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

interface ReminderSettingsModalProps {
  client: Client;
  onClose: () => void;
  reminderProfiles: ReminderProfile[];
  receivable: Receivable;
}

export default function ReminderSettingsModal({
  client,
  onClose,
  receivable,
}: ReminderSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [automaticReminder, setAutomaticReminder] = useState<boolean>(
    receivable.automatic_reminder ?? false
  );

 const [defaultProfile, setDefaultProfile] = useState(null);

  useEffect(() => {
    const fetchDefaultProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) return;

      const { data, error } = await supabase
        .from('reminder_profile')
        .select('*')
        .eq('name', 'Default')
        .eq('owner_id', user.id)
        .single(); // attend une seule ligne

      if (error) {
        if (error.code !== 'PGRST116') { // Pas de profil trouvé
          alert("error: ",error)
          showError(error.message);
        }
        setDefaultProfile(null);
      } else {
        setDefaultProfile(data);
      }
    };

    fetchDefaultProfile();
  console.log("DEFAULT PROFILE: ",defaultProfile)
  }, []);
  const [formData, setFormData] = useState({
    reminder_delay_1: client.reminder_delay_1 || { j: 0, h: 0, m: 1 },
    reminder_delay_2: client.reminder_delay_2 || { j: 0, h: 0, m: 2 },
    reminder_delay_3: client.reminder_delay_3 || { j: 0, h: 0, m: 3 },
    reminder_delay_final: client.reminder_delay_final || { j: 0, h: 0, m: 3 },
    reminder_template_1: client.reminder_template_1 || "",
    reminder_template_2: client.reminder_template_2 || "",
    reminder_template_3: client.reminder_template_3 || "",
    pre_reminder_enable:client.pre_reminder_enable,
    reminder_enable_1:client.reminder_enable_1,
    reminder_enable_2:client.reminder_enable_2,
    reminder_enable_3:client.reminder_enable_3,
    reminder_enable_final:client.reminder_enable_final,
    reminder_template_final: client.reminder_template_final || "",
    reminder_profile: client.reminder_profile || defaultProfile?.id,
    reminder_date_1: client.reminder_date_1 ?? new Date().toISOString(),
  reminder_date_2: client.reminder_date_2 ?? new Date().toISOString(),
  reminder_date_3: client.reminder_date_3 ?? new Date().toISOString(),
  reminder_date_final: client.reminder_date_final ?? new Date().toISOString(),
  pre_reminder_date: client.pre_reminder_date ?? new Date().toISOString(),
    pre_reminder_delay: client.pre_reminder_delay || { j: 0, h: 0, m: 0 },
    pre_reminder_template: client.pre_reminder_template || "",
  });
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

 

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
  const [hasPastDate,setHasPastDate]=useState(false)

  useEffect(() => {
    const now = startOfMinute(new Date()); // tronque à la minute près
  
    // Pré-calcul des dates
    const {
      reminder_date_1: firstReminderDate,
      reminder_date_2: secondReminderDate,
      reminder_date_3: thirdReminderDate,
      reminder_date_final: finalReminderDate,
      pre_reminder_date: preReminderDate,
    } = formData;
  
    const isTherePastDate = [
      firstReminderDate,
      secondReminderDate,
      thirdReminderDate,
      finalReminderDate,
      preReminderDate,
    ].some((date) => date && isBefore(startOfMinute(new Date(date)), now)); // tronque aussi les dates
  
    setHasPastDate(isTherePastDate);
  }, [formData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {

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
          pre_reminder_enable:formData.pre_reminder_enable,
          reminder_enable_1:formData.reminder_enable_1,
          reminder_enable_2:formData.reminder_enable_2,
          reminder_enable_3:formData.reminder_enable_3,
          reminder_enable_final:formData.reminder_enable_final,
          reminder_date_1:formData.reminder_date_1,
          reminder_date_2:formData.reminder_date_2,
          reminder_date_3:formData.reminder_date_3,
          reminder_date_final:formData.reminder_date_final,
          pre_reminder_date:formData.pre_reminder_date,
          reminder_profile: formData.reminder_profile,
          pre_reminder_delay: formData.pre_reminder_delay,
          pre_reminder_template: formData.pre_reminder_template,
        })
        .eq("id", client.id);
      if (user?.id) {
        const details = JSON.stringify(
          {
            "Numéro de facture": `${receivable.invoice_number}`,
            "Délai de relance 1": `${formData.reminder_delay_1.j || 0}:${
              formData.reminder_delay_1.h || 0
            }:${formData.reminder_delay_1.m || 0} `,
            "Délai de relance 2": `${formData.reminder_delay_2.j || 0}:${
              formData.reminder_delay_2.h || 0
            }:${formData.reminder_delay_2.m || 0} `,
            "Délai de relance 3": `${formData.reminder_delay_3.j || 0}:${
              formData.reminder_delay_3.h || 0
            }:${formData.reminder_delay_3.m || 0} `,
            "Délai de relance finale": `${
              formData.reminder_delay_final.j || 0
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
        ); // le 2 ajoute un peu d’indentation pour la lisibilité
        try {
          await saveNotification({
            owner_id: user.id,
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
      showError( "Impossible de mettre à jour les paramètres, vérifier le profil du client!");
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
    return examples[step] || "";
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
        owner_id: user?.id,
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
          owner_id: user?.id,
          is_read: false,
          type: "erreur",
          message: "Mise à jour des paramètres de relance automatique échouée",
          details: `${error}`,
        });
      }
      showError(error.message || "Impossible de mettre à jour les paramètres");
    } finally {
      setLoading(false);
    }
  };
  function delayToDateTime(
    delay: { j: number; h: number; m: number },
    baseDate: Date = new Date()
  ): Date {
    if (!delay) return new Date(); // fallback

    const result = new Date(baseDate);
    result.setMinutes(
      result.getMinutes() +
        (delay.j || 0) * 1440 +
        (delay.h || 0) * 60 +
        (delay.m || 0)
    );
    //	console.log("Datetime: ",result);

    return result;
  }



  const dueDate = new Date(receivable.due_date);
  dueDate.setHours(0, 0, 0, 0);

 


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-scroll">
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold mb-2">Paramètres de relance</h2>

          <div className="flex justify-between">
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
          </div>
          {hasPastDate && (
            <div className="mb-4 p-4 border border-yellow-400 bg-yellow-100 text-yellow-800 rounded">
              Certaines dates de relance sont antérieures à la date actuelle.
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
			<div className="fixed top-0 left-1/2 -translate-x-1/2 mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 z-[9999999999999999999999999999]">
  Paramètres sauvegardés avec succès
</div>

          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateTimeInput
                label="Date/Heure d’envoi – Première relance"
                value={new Date(formData.reminder_date_1)}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    reminder_date_1:date.toISOString() ,
                  })

                }
                optional={formData.reminder_enable_1}
                onToggleOptional={(checked) =>
                  setFormData({
                    ...formData,
                    reminder_enable_1: checked,
                  })
                }
              />

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
            </div>
            {/*end relance en calendrier */}
            {/* accordéon*/}
            {formData.pre_reminder_enable &&(
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
     value={formData.reminder_template_1}
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
       value={formData.reminder_template_2}
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
       value={formData.reminder_template_3}
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
       value={formData.reminder_template_final}
       onChange={(e) =>
         setFormData({
           ...formData,
           reminder_template_final: e.target.value,
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
              {/* <button
								type='button'
								// onClick={onClose}
								disabled={loading}
								className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
							> */}

              {/* </button> */}
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
