import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Client, Receivable } from "../../types/database";
import { X, Upload, FileUp } from "lucide-react";
import Swal from "sweetalert2";
import { sendEmail } from "../../lib/email";
import Settings from "../settings/Settings";
import { getEmailSettings } from "../../lib/reminderService";

interface ReceivableEditFormProps {
  onClose: () => void;
  onReceivableUpdated: (receivable: Receivable & { client: Client }) => void;
  receivable: Receivable & { client: Client };
}

export default function ReceivableEditForm({
  onClose,
  onReceivableUpdated,
  receivable,
}: ReceivableEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clientEmails] = useState<string[]>(
    receivable.client.email.split(",") || []
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    invoice_number: receivable.invoice_number,
    amount: receivable.amount.toString(),
    paid_amount: receivable.paid_amount
      ? receivable.paid_amount.toString()
      : "0",
    document_date: receivable.document_date || "",
    due_date: receivable.due_date,
    installment_number: receivable.installment_number || "",
    status: receivable.status,
    invoice_pdf_url: receivable.invoice_pdf_url || "",
    notes: receivable.notes || "",
    email: receivable.email || "",
  });
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  const showSuccess = (message: string) => {
    console.log("MEssage:", message);

    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
      setLoading(false);
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

  // Fonction pour vérifier si un client a d'autres créances impayées
  const checkClientUnpaidReceivables = async (
    clientId: string,
    currentReceivableId: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("receivables")
        .select("id")
        .eq("client_id", clientId)
        .neq("id", currentReceivableId) // Exclure la créance actuelle
        .not("status", "eq", "paid") // Toutes les créances non payées
        .limit(1);

      if (error) throw error;

      // Si data est vide, le client n'a pas d'autres créances impayées
      return data && data.length === 0;
    } catch (error) {
      console.error("Erreur lors de la vérification des créances:", error);
      return false;
    }
  };

  // Fonction pour mettre à jour le status de relance du client
  const updateClientReminderStatus = async (
    clientId: string,
    needsReminder: boolean
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({ needs_reminder: needsReminder })
        .eq("id", clientId);

      if (error) throw error;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut de relance:",
        error
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let invoicePath = "";
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non authentifié");

    try {
      const wasAlreadyPaid = receivable.status === "paid";
      const willBePaid = formData.status === "paid";

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }

      if (uploadedFile) {
        const filePath = `${user.id}/${uploadedFile.name}`;
        const { data: existingFile, error: statError } = await supabase.storage
          .from("invoices")
          .list(user.id, {
            limit: 100,
          });

        if (statError) throw statError;
        let isOverwrite = false;

        if (existingFile && existingFile.length > 0) {
          const fileUrl = `${receivable.invoice_pdf_url}`;
          if (fileUrl !== "null") {
            try {
              const response = await fetch(fileUrl, {
                method: "GET",
              });

              if (response.ok) {
                isOverwrite = true;
              } else {
                isOverwrite = false;
              }
            } catch (error) {
              isOverwrite = false;
              console.error(
                "Erreur lors de la vérification du fichier :",
                error
              );
            }
          } else {
            isOverwrite = false;
          }
        }

        const fileExists =
          existingFile && existingFile.length > 0 && isOverwrite;
        const { isConfirmed } = await Swal.fire({
          title: fileExists
            ? "Écraser le fichier PDF existant ?"
            : "Ajouter ce nouveau fichier ?",
          text: fileExists
            ? `Un fichier existe déjà. Voulez-vous le remplacer par "${uploadedFile.name}"?`
            : `Voulez-vous ajouter le fichier "${uploadedFile.name}" à vos documents ?`,
          showCancelButton: true,
          confirmButtonText: fileExists ? "Oui, écraser" : "Oui, ajouter",
          cancelButtonText: "Annuler",
        });

        if (!isConfirmed) {
          setLoading(false);
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from("invoices")
          .upload(filePath, uploadedFile, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        invoicePath = `${supabaseUrl}/storage/v1/object/public/invoices/${filePath}`;
      }
      const { data, error } = await supabase
        .from("receivables")
        .update({
          ...formData,
          amount: parseFloat(formData.amount),
          paid_amount: formData.paid_amount
            ? parseFloat(formData.paid_amount)
            : 0,
          document_date: formData.document_date || null,
          installment_number: formData.installment_number || null,
          invoice_pdf_url: invoicePath ? invoicePath : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", receivable.id)
        .select("*, client:clients(*)")
        .single();

      if (error) {
        throw error;
      } /*else {
        showSuccess("Mise à jour complète.");
      } */

      if (willBePaid && !wasAlreadyPaid) {
        const noOtherUnpaidReceivables = await checkClientUnpaidReceivables(
          receivable.client.id,
          receivable.id
        );
        const emailSettings = await getEmailSettings(user.id);
        if (!emailSettings) {
          showError("La notification par email a échouée!");
          return false;
        }
        if (data && data.client) {
          data.client.needs_reminder = false;
          const { data: notification_settings, error } = await supabase
            .from("notification_settings")
            .select("payment_notifications")
            .eq("user_id", user.id)
            .maybeSingle();
          if (error) throw error;
          const payment_notifications =
            notification_settings?.payment_notifications;
          console.log(payment_notifications);
          if (payment_notifications === true) {
            const emailSent = sendEmail(
              emailSettings,
              user.email ?? "",
              "Paiement d'une créance",
              "La créance de " +
                data.client.company_name +
                ", portant le numéro de facture " +
                data.invoice_number +
                ", a été marquée comme payée."
            );

            if (!emailSent) {
              showError("La notification par email a échouée!");
            }
          }
        }/* 
        if (noOtherUnpaidReceivables) {
          await updateClientReminderStatus(receivable.client.id, false);
          //Jet notification
        } */
      }
    //  if (receivable.status === "pending") {
        await updateClientReminderStatus(receivable.client.id, true);
    //  }
      if (data) {
        showSuccess("Mise à jour complète.");
        onReceivableUpdated({
          ...data,
          client: data.client as Client,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la modification de la créance:", error);
      showError("Impossible de modifier la créance");
    } finally {
      showSuccess("Mise à jour complète.");
    }
  };

  useEffect(() => {
    if (!formData.email && clientEmails.length > 0) {
      setFormData((prev) => ({
        ...prev,
        email: receivable.email || clientEmails[0], // ou une logique spécifique ici
      }));
    }
  }, [clientEmails]);

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

          <h2 className="text-2xl font-bold mb-2">Modifier la créance</h2>
          <p className="text-gray-600 mb-6">
            Client : {receivable.client.company_name}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-center text-green-700 z-50 w-[550px]">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <select
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un email</option>

                {/* Rajouter l'email de formData si jamais il n'est pas dans clientEmails */}
                {!clientEmails.includes(formData.email) && formData.email && (
                  <option value={formData.email}>{formData.email} </option>
                )}

                {clientEmails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de facture *
              </label>
              <input
                type="text"
                required
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant Réglé (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.paid_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paid_amount: e.target.value || "0",
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date pièce
              </label>
              <input
                type="date"
                value={formData.document_date}
                onChange={(e) =>
                  setFormData({ ...formData, document_date: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance *
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro échéance
              </label>
              <input
                type="text"
                value={formData.installment_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    installment_number: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value as typeof formData.status;
                  setFormData((prev) => ({
                    ...prev,
                    status: newStatus,
                    paid_amount:
                      newStatus === "paid" ? prev.amount : prev.paid_amount,
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
                <option value="legal">Contentieux</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF de la facture
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {uploadedFile ? (
                    <>
                      <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 flex gap-2 items-center">
                          <span>{uploadedFile.name}</span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setUploadedFile(null);
                            }}
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Télécharger un fichier</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf"
                            onChange={(e) => {
                              // Logique de téléchargement du fichier à implémenter
                              setUploadedFile(e.target.files?.[0] || null);
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                    </>
                  )}
                </div>
              </div>
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
                {loading ? "Enregistrement..." : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
