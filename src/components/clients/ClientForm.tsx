import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Client, Receivable, ReminderProfile } from "../../types/database";
import { confirmAlert } from "react-confirm-alert";
import { Minus, Plus, X } from "lucide-react";
import "react-confirm-alert/src/react-confirm-alert.css";

interface ClientFormProps {
  onClose: () => void;
  onClientAdded?: (client: Client) => void;
  onClientUpdated?: (client: Client) => void;
  client?: Client;
  mode?: "create" | "edit";
}

export default function ClientForm({
  onClose,
  onClientAdded,
  onClientUpdated,
  client,
  mode = "create",
}: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emails, setEmails] = useState(
    client?.email.split(",").filter((e) => e.trim()) || [""]
  );
  const [formData, setFormData] = useState({
    company_name: client?.company_name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    postal_code: client?.postal_code || "",
    city: client?.city || "",
    country: client?.country || "France",
    industry: client?.industry || "",
    website: client?.website || "",
    reminder_profile: client?.reminder_profile || "",
    needs_reminder: client?.needs_reminder || false,
    client_code: client?.client_code || "",
    notes: client?.notes || "",
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const AddReceivableToClient = async (receivable: Receivable) => {
    const { error: insertError } = await supabase
      .from("receivables")
      .insert(receivable);

    if (insertError) {
      console.error("Erreur lors de l'insertion:", insertError);
    }
  };
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
    setFormData({
      ...formData,
      email: newEmails.filter((item) => item.trim() !== "").join(","),
    });
  };

  const handleEmailDelete = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    if (newEmails.length === 0) {
      newEmails.push("");
    }
    setEmails(newEmails);
    setFormData({
      ...formData,
      email: newEmails.filter((item) => item.trim() !== "").join(","),
    });
  };

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const isValidEmail = (email: string) => {
    return email === "" || /^[^@]*@[^@]*$/.test(email);
  };

  // Handle change for reminder_profile select
  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      reminder_profile: e.target.value || "",
    });
  };

  //suppresion créance
  const handleNeedReminders = async () => {
    confirmAlert({
      title: "Confirmation",
      message: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      buttons: [
        {
          label: "Oui",
          onClick: async () => {
            // Ajouter async ici
            const { error: deleteError } = await supabase
              .from("receivables")
              .delete()
              .eq("client_id", client?.id);

            if (deleteError) {
              console.error(
                "Erreur lors de la suppression des relances :",
                deleteError
              );
              return;
            } else {
              console.log("Relance supprimée avec succès.");
            }
          },
        },
        {
          label: "Non",
          className: "no-button",
          onClick: async () => {},
        },
      ],
    });
  };

  //soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }

      if (mode === "create") {
        const dbFormData = {
          ...formData,
          reminder_profile: formData.reminder_profile === "" ? null : formData.reminder_profile,
          reminder_delay_1: { j: 1, h: 0, m: 0 },
          reminder_delay_2: { j: 1, h: 0, m: 0 },
          reminder_delay_3: { j: 1, h: 0, m: 0 },
          reminder_delay_final: { j: 1, h: 0, m: 0 },
          owner_id: user.id,
        };
        const { data, error } = await supabase
          .from("clients")
          .insert([dbFormData])
          .select()
          .single();

        if (error) throw error;

        if (formData.needs_reminder) {
          const now = new Date();
          const formatted =
            now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, "0") +
            now.getDate().toString().padStart(2, "0") +
            now.getHours().toString().padStart(2, "0") +
            now.getMinutes().toString().padStart(2, "0") +
            now.getSeconds().toString().padStart(2, "0");

          const random = Math.floor(Math.random() * 1000);
          const invoiceNumber = `FACT-${formatted}${random}`;

          const newReceivable: Omit<Receivable, "id"> = {
            client_id: data.id,
            invoice_number: invoiceNumber,
            amount: 0,
            due_date: new Date().toISOString(),
            status: "pending",
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          await AddReceivableToClient(newReceivable as Receivable);
        }

        if (data && onClientAdded) {
          onClientAdded(data);
        }
      } else {
        const { data: clientBeforeUpdate } = await supabase
          .from("clients")
          .select("needs_reminder")
          .eq("id", client?.id)
          .single();
        /*   setFormData({
				...formData,
				reminder_profile: reminder_profile? reminder_profile : ""
			  }); */
        if (formData.reminder_profile === "") {
          formData.reminder_profile = "";
        }

        const { data, error } = await supabase
          .from("clients")
          .update(formData)
          .eq("id", client?.id)
          .select()
          .single();

        if (error) throw error;

        // Si needs_reminder était true et devient false
        if (clientBeforeUpdate?.needs_reminder && !formData.needs_reminder) {
          const { data: receivables, error: receivableError } = await supabase
            .from("receivables")
            .select("*")
            .eq("client_id", client?.id);

          if (receivableError) {
            console.error(
              "Erreur lors de la récupération des relances :",
              receivableError
            );
            return;
          }

          if (receivables && receivables.length > 0) {
            handleNeedReminders();
          }
        }

        if (formData.needs_reminder) {
          const { data: receivables, error: receivableError } = await supabase
            .from("receivables")
            .select("*")
            .eq("client_id", client?.id);

          if (receivableError) {
            console.error(
              "Erreur lors de la récupération des relances :",
              receivableError
            );
            return;
          }

          if (!receivables || receivables.length === 0) {
            const now = new Date();
            const formatted =
              now.getFullYear().toString() +
              (now.getMonth() + 1).toString().padStart(2, "0") +
              now.getDate().toString().padStart(2, "0") +
              now.getHours().toString().padStart(2, "0") +
              now.getMinutes().toString().padStart(2, "0") +
              now.getSeconds().toString().padStart(2, "0");

            const random = Math.floor(Math.random() * 1000);
            const invoiceNumber = `FACT-${formatted}${random}`;

            const newReceivable: Omit<Receivable, "id"> = {
              client_id: data.id,
              invoice_number: invoiceNumber,
              amount: 0,
              due_date: new Date().toISOString(),
              status: "pending",
              owner_id: user.id,
              automatic_reminder: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            await AddReceivableToClient(newReceivable as Receivable);
          } else {
            console.log(
              "Le client possède déjà une relance, aucune création nécessaire."
            );
          }
        }

        if (data && onClientUpdated) {
          onClientUpdated(data);
        }

        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de l'opération sur le client :", error);
      setError(
        `Une erreur est survenue lors de ${
          mode === "create" ? "l'ajout" : "la modification"
        } du client.`
      );
    } finally {
      setLoading(false);
    }
  };

  const [reminderProfiles, setReminderProfiles] = useState<ReminderProfile[]>(
    []
  );

  const fetchReminderProfiles = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Erreur lors de la récupération de l’utilisateur",
        userError
      );
      return;
    }

    const { data, error } = await supabase
      .from("reminder_profile")
      .select()
      .eq("owner_id", user.id);

    if (error) {
      console.error(
        "Erreur lors de la récupération des profils de rappel",
        error
      );
      return;
    }

    setReminderProfiles(data || []);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-scroll">
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-xl mx-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold mb-6">
            {mode === "create" ? "Nouveau client" : "Modifier le client"}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Client *
              </label>
              <input
                type="text"
                required
                value={formData.client_code}
                onChange={(e) =>
                  setFormData({ ...formData, client_code: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex flex-col gap-1 w-full">
                {emails.map((email, index) => (
                  <div
                    className="flex gap-1 justify-between items-end"
                    key={`email-${index}`}
                  >
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email {index === 0 ? "*" : ""}
                      </label>
                      <input
                        type="text"
                        required={index === 0}
                        value={email}
                        onChange={(e) =>
                          handleEmailChange(index, e.target.value)
                        }
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isValidEmail(email) && email !== ""
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="exemple@domaine.com"
                      />
                      {!isValidEmail(email) && email !== "" && (
                        <p className="text-red-500 text-sm mt-1">
                          L'email doit contenir un @
                        </p>
                      )}
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleEmailDelete(index)}
                        title="Supprimer l'e-mail"
                        className="px-2 py-2 text-red-600 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 h-[50px]"
                        disabled={index === 0 && emails.length === 1}
                      >
                        <Minus />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="mt-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2 w-fit"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un email
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site internet
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profil de rappel
              </label>
              <select
                value={formData.reminder_profile}
                onChange={handleProfileChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option key={null} value="">
                  Ne pas utiliser de profile
                </option>
                {reminderProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              {/* <input
                type="checkbox"
                id="needs_reminder"
                checked={formData.needs_reminder}
                onChange={(e) =>
                  setFormData({ ...formData, needs_reminder: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              /> */}
              <div className="d-flex items-center min-h-[40px] mb-2 mt-1" style={{display: "flex", alignItems: "center"}}>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs_reminder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        needs_reminder: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all 
    peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <label
                htmlFor="needs_reminder"
                className="ml-2 block text-sm text-gray-700"
              >
                Nécessite une relance
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Enregistrement..."
                  : mode === "create"
                  ? "Enregistrer"
                  : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
