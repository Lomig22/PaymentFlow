import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Client, Receivable, Reminder } from "../../types/database";
import { AlertCircle, Eye, FileText, Mail, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { decodeReminderStatus } from "../../lib/decodeReminderStatus";
import Swal from "sweetalert2";
import { File } from "lucide-react";
import { useAbonnement } from "../context/AbonnementContext";

const ReminderList = () => {
  const { checkAbonnement } = useAbonnement();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<
    (Reminder & { receivable: Receivable & { client: Client } })[]
  >([]);
  const handleClick = () => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
    return true;
  };
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  const fetchRecords = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      const { data: clientsData, error } = await supabase
        .from("reminders")
        .select(
          `
			  *,
			  receivable:receivables(
				*,
				client:clients(*)
			  )
			`
        )
        .eq("receivable.owner_id", user.id)
        .order("reminder_date", { ascending: false });

      if (error) throw error;
      setRecords(clientsData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      showError("Impossible de charger la liste des clients");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRecords();
  }, []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedAll, setSelectedAll] = useState(false);

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAll) {
      setSelectedIds([]);
      setSelectedAll(false);
    } else {
      setSelectedIds(records.map((r) => r.id));
      setSelectedAll(true);
    }
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const { error } = await supabase
      .from("reminders")
      .delete()
      .in("id", selectedIds);

    if (error) {
      console.error("Erreur lors de la suppression :", error.message);
    } else {
      setSelectedIds([]);
      setSelectedAll(false);
      // Tu peux aussi recharger les données ici
      fetchRecords(); // ou ta méthode de rafraîchissement
    }
  };
  const handleBulkDeleteConfirmation = async () => {
    const result = await Swal.fire({
      title: "Es-tu sûr ?",
      text: "Cette action est irréversible !",
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "bg-red-600 text-white px-4 py-2 rounded mr-2 hover:bg-red-700",
        cancelButton:
          "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
      },
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      handleBulkDelete();
      Swal.fire(
        "Supprimé!",
        "Les éléments sélectionnés ont été supprimés.",
        "success"
      );
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const deleteReminder = async (id: any) => {
    const { error } = await supabase.from("reminders").delete().eq("id", id);

    if (error) {
      Swal.fire("Erreur", error.message, "error");
    } else {
      setRecords((prev) => prev.filter((record) => record.id !== id));
      Swal.fire("Supprimé !", "La relance a bien été supprimée.", "success");
    }
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relance</h1>
        <Link to="/receivables" className="flex items-center h-16 px-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Créances
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* <div className='relative mb-6'>
				<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
				<input
					type='text'
					placeholder='Rechercher par nom, code client...'
					// value={searchTerm}
					// onChange={(e) => setSearchTerm(e.target.value)}
					className='pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
			</div> */}
      {selectedIds.length > 0 && (
        <div className="ml-4 mb-2 text-sm text-gray-700 flex items-center gap-3">
          {selectedIds.length} élément(s) sélectionné(s)
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const allowed = handleClick();
              if (!allowed) return;
              handleBulkDeleteConfirmation();
            }}
            disabled={selectedIds.length === 0}
            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-semibold transition duration-200 ${
              selectedIds.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-red-600 text-white  hover:bg-red-200"
            }`}
          >
            Supprimer la sélection
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    title="Tout sélectionner"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  code client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  numéro de facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  type de Relance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => handleSelectRow(record.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.reminder_date).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.receivable?.client?.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.receivable?.client?.client_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.receivable?.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record?.receivable?.invoice_pdf_url ? (
                      <a
                        href={record?.receivable.invoice_pdf_url}
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="grid"
                      >
                        <button
                          className="text-gray-600 hover:text-gray-800"
                          title="View Invoice"
                        >
                          <File className="h-5 w-5" />
                        </button>
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {decodeReminderStatus(record.reminder_type)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-3">
                    {/* Voir email */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const allowed = handleClick();
                        if (!allowed) return;
                        Swal.fire({
                          title: "Email envoyé",
                          html: `<div style="text-align:left">${
                            record.email_content || "Aucun contenu."
                          }</div>`,
                          confirmButtonText: "Fermer",
                          customClass: {
                            popup: "text-left",
                            confirmButton:
                              "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
                          },
                          width: "600px",
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir l’email"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {/* Supprimer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const allowed = handleClick();
                        if (!allowed) return;
                        Swal.fire({
                          title: "Confirmer la suppression",
                          text: "Voulez-vous vraiment supprimer cette ligne de l'historique des relances ?",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#3085d6",
                          confirmButtonText: "Supprimer",
                          cancelButtonText: "Annuler",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            deleteReminder(record.id); // Assure-toi que cette fonction existe
                            Swal.fire({
                              title: "Supprimé!",
                              text: "La relance a été supprimée.",
                              icon: "success",
                              buttonsStyling: false,
                              customClass: {
                                confirmButton:
                                  "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
                                icon: "text-blue-500",
                              },
                              confirmButtonText: "OK",
                            });
                          }
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReminderList;
