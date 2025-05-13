import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Receivable,
  Client,
  ReminderProfile,
  Reminder,
} from "../../types/database";
import {
  Plus,
  Mail,
  AlertCircle,
  Clock,
  Edit,
  Search,
  Trash2,
  Upload,
  X,
  Check as CheckIcon,
  Info,
  ListRestart,
  File,
  Pause,
  MoreHorizontal,
  Play,
} from "lucide-react";
import ReceivableForm from "./ReceivableForm";
import ReceivableEditForm from "./ReceivableEditForm";
import ReminderSettingsModal from "./ReminderSettingsModal";
import {
  getReminderTemplate,
  sendManualReminder,
  getEmailSettings,
} from "../../lib/reminderService";
import CSVImportModal, { CSVMapping } from "./CSVImportModal";
import ReminderHistory from "./ReminderHistory";
import { Link } from "react-router-dom";
import { dateCompare, numberCompare, stringCompare } from "../../lib/comparers";
import SortableColHead from "../Common/SortableColHead";
import { dateDiff } from "../../lib/dateDiff";
import { saveNotification } from "../../lib/notification";
import Swal from "sweetalert2";
import { getReminderStatus } from "../../lib/function";
import { isBefore } from "date-fns";
import ReceivableStatusBadge from "./receivableStatusBadge";
import Tooltip from "../Common/Tooltip";
type SortColumnConfig = {
  key: keyof CSVMapping | "client" | "email" | "Delay in Days";
  sort: "none" | "asc" | "desc";
};

function ReceivablesList() {
  const [receivables, setReceivables] = useState<
    (Receivable & { client: Client })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<
    (Receivable & { client: Client }) | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [receivableToDelete, setReceivableToDelete] = useState<
    (Receivable & { client: Client }) | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [showReminderHistory, setShowReminderHistory] = useState(false);
  const [reminderHistroy, setReminderHistory] = useState<Reminder[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [reminderProfiles, setReminderProfiles] = useState<ReminderProfile[]>(
    []
  );
  const [sortConfig, setSortConfig] = useState<SortColumnConfig | null>({
    key: "client",
    sort: "asc",
  });
  const [showConfirmSendReminder, setShowConfirmReminder] = useState(false);
  const [sending, setSending] = useState(false);
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  const [content, setContent] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [isDropdownAbove, setIsDropdownAbove] = useState(false);

  const fetchReceivables = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const { data, error } = await supabase
        .from("receivables")
        .select(`*, client:clients(*)`)
        .eq("owner_id", user.id)
        .order("due_date", { ascending: false });

      if (error) {
        throw error;
      }
      const { data: reminderPorfile } = await supabase
        .from("reminder_profile")
        .select()
        .eq("owner_id", user.id);
      setReminderProfiles(reminderPorfile || []);

      if (error) throw error;
      setReceivables(data || []);

      const { data: reminderHistroyData, error: reminderHistroyError } =
        await supabase
          .from("reminders")
          .select("*")
          .order("reminder_date", { ascending: false });

      if (reminderHistroyError) throw reminderHistroyError;
      setReminderHistory(reminderHistroyData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des créances:", error);
      showError("Impossible de charger les créances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  useEffect(() => {
    if (importSuccess) {
      const timer = setTimeout(() => {
        setImportSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importSuccess]);
  //récupération du template actuelle:
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedReceivable) {
        setContent("");
        setSubject("");
        setSignature("");
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Utilisateur non connecté");
        return;
      }

      // Récupérer la signature
      const emailSettings = await getEmailSettings(user.id);
      if (emailSettings?.email_signature) {
        setSignature(emailSettings.email_signature);
      }

      // Récupérer le contenu et le niveau
      const result = await getReminderTemplate(selectedReceivable.id);
      if (result) {
        const subjectLine = `Relance facture ${selectedReceivable.invoice_number}`;
        setSubject(subjectLine);
        setContent(result.template); // ou formatté si le template est déjà rempli
      }
    };

    fetchData();
  }, [selectedReceivable]);

  // Fonction pour vérifier si un client a des créances impayées
  const checkClientUnpaidReceivables = async (
    clientId: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("receivables")
        .select("id")
        .eq("client_id", clientId)
        .not("status", "eq", "paid") // Toutes les créances non payées
        .limit(1);

      if (error) throw error;

      // Si data est vide, le client n'a pas de créances impayées
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

  const handleDeleteClick = (receivable: Receivable & { client: Client }) => {
    setReceivableToDelete(receivable);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!receivableToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const clientId = receivableToDelete.client_id;

      const { error } = await supabase
        .from("receivables")
        .delete()
        .eq("id", receivableToDelete.id);

      if (error) throw error;

      // Mettre à jour la liste des créances
      setReceivables(receivables.filter((r) => r.id !== receivableToDelete.id));
      setShowDeleteConfirm(false);
      setReceivableToDelete(null);

      // Vérifier si le client a encore des créances impayées
      const noUnpaidReceivables = await checkClientUnpaidReceivables(clientId);

      // Si le client n'a plus de créances impayées, désactiver les relances
      if (noUnpaidReceivables) {
        await updateClientReminderStatus(clientId, false);

        // Mettre à jour l'état local pour refléter le changement
        setReceivables((prevReceivables) =>
          prevReceivables.map((r) => {
            if (r.client_id === clientId) {
              return {
                ...r,
                client: {
                  ...r.client,
                  needs_reminder: false,
                },
              };
            }
            return r;
          })
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showError("Impossible de supprimer la créance");
    } finally {
      setDeleting(false);
    }
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    // Étape 1 : Récupérer les receivables sélectionnés pour obtenir les client_id
    const { data: receivablesToDelete, error: fetchError } = await supabase
      .from("receivables")
      .select("client_id")
      .in("id", selectedIds);

    if (fetchError) {
      console.error(
        "Erreur lors de la récupération des données clients :",
        fetchError.message
      );
      return;
    }

    // Extraire les client_id uniques
    const clientIds = [
      ...new Set(receivablesToDelete.map((r: any) => r.client_id)),
    ];

    // Étape 2 : Supprimer les receivables
    const { error: deleteError } = await supabase
      .from("receivables")
      .delete()
      .in("id", selectedIds);

    if (deleteError) {
      console.error("Erreur lors de la suppression :", deleteError.message);
      return;
    }

    // Étape 3 : Mettre à jour les statuts de relance des clients
    for (const clientId of clientIds) {
      await updateClientReminderStatus(clientId, false); // ou true selon ta logique
    }

    // Étape 4 : Rafraîchir l'état local
    setSelectedIds([]);
    setSelectedAll(false);
    fetchReceivables();
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
  const handleSendReminder = async () =>
    // receivable: Receivable & { client: Client }
    {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");
      try {
        setError(null);
        if (selectedReceivable == null) return;
        setSending(true);
        const success = await sendManualReminder(
          selectedReceivable.id,
          subject?.trim() || undefined,
          content?.trim() || undefined,
          signature?.trim() || undefined
        );
        if (success) {
          setSendSuccess(true);
          if (user.id) {
            try {
              await saveNotification({
                owner_id: user.id,
                is_read: false,
                type: "info",
                message: "Relance effectuée correctement",
                details: `Relance ${selectedReceivable.client.company_name}\nDestinataire : ${selectedReceivable.email}`,
              });
            } catch (error: any) {
              showError(error);
            }
          }
          // Masquer le message après 3 secondes
          setTimeout(() => {
            setSendSuccess(false);
          }, 3000);
          await fetchReceivables();
        } else {
          if (selectedReceivable.status === "Relance finale") {
            await saveNotification({
              owner_id: user.id,
              is_read: false,
              type: "erreur",
              message: "Relançe manuelle échouée",
              details:
                "client: " +
                selectedReceivable.client.company_name +
                "\ndestinataire: " +
                selectedReceivable.email +
                "\nerreur: Le status de cette créance est déjà en relance finale",
            });
            showError("Le status de cette créance est déjà en relance finale");
          } else {
            await saveNotification({
              owner_id: user.id,
              is_read: false,
              type: "erreur",
              message: "Relançe manuelle échouée",
              details:
                "client: " +
                selectedReceivable.client.company_name +
                "\ndestinataire: " +
                selectedReceivable.email +
                "\nerreur: Impossible d'envoyer la relance. Vérifiez les paramètres email, la signature et les templates.",
            });
            showError(
              "Impossible d'envoyer la relance. Vérifiez les paramètres email, la signature et les templates."
            );
          }
        }
        setSending(false);
        setShowConfirmReminder(false);
        setSelectedClient(null);
      } catch (error: any) {
        await saveNotification({
          owner_id: user.id,
          is_read: false,
          type: "erreur",
          message: "Relançe manuelle échouée",
          details:
            "client: " +
              selectedReceivable?.client.company_name +
              "\ndestinataire: " +
              selectedReceivable?.email +
              "\nerreur:" +
              error.message || "Erreur lors de l'envoi de la relance",
        });
        showError(error.message || "Erreur lors de l'envoi de la relance");
        setSending(false);
        setShowConfirmReminder(false);
        setSelectedClient(null);
      }
    };

  const handleImportSuccess = async (importedCount: number) => {
    setImportSuccess(`${importedCount} créance(s) importée(s) avec succès`);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await saveNotification({
      owner_id: user?.id,
      is_read: false,
      type: "info",
      message: `importation de ${importedCount} créance(s)`,
      details: "",
    });
    fetchReceivables();
    setShowImportModal(false);
  };

  const handleMouseEnter = (receivableId: string) => {
    setTooltipVisible(receivableId);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(null);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const handleOnClose = () => {
    setSelectedReceivable(null);
    setShowReminderHistory(false);
  };

  const handleSortOnClick = (key: keyof CSVMapping | "Delay in Days") => {
    if (sortConfig?.key === key) {
      setSortConfig({
        ...sortConfig,
        sort: sortConfig.sort === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({
        key,
        sort: "asc",
      });
    }
  };

  const applySorting = (
    a: Receivable & { client: Client },
    b: Receivable & { client: Client }
  ) => {
    if (!sortConfig) return 0;
    const { key, sort } = sortConfig;
    if (key === "client") {
      return stringCompare(
        a.client?.company_name ?? "",
        b.client?.company_name ?? "",
        sort
      );
    }
    if (key === "client_code") {
      return stringCompare(a.client.client_code, b.client.client_code, sort);
    }
    if (key === "email") {
      return stringCompare(a.email ?? "", b.email ?? "", sort);
    }
    if (key === "invoice_number") {
      return stringCompare(a.invoice_number, b.invoice_number, sort);
    }
    if (key === "amount") {
      return numberCompare(a.amount, b.amount, sort);
    }
    if (key === "paid_amount") {
      return numberCompare(a.paid_amount ?? 0, b.paid_amount ?? 0, sort);
    }
    if (key === "status") {
      return stringCompare(a.status ?? "", b.status ?? "", sort);
    }
    if (key === "document_date") {
      return dateCompare(a.document_date ?? "", b.document_date ?? "", sort);
    }
    if (key === "due_date") {
      return dateCompare(a.due_date ?? "", b.due_date ?? "", sort);
    }
    if (key === "installment_number") {
      return stringCompare(
        a.installment_number ?? "",
        b.installment_number ?? "",
        sort
      );
    }
    if (key === "Delay in Days") {
      return numberCompare(
        dateDiff(new Date(a.due_date), new Date()),
        dateDiff(new Date(b.due_date), new Date()),
        sort
      );
    }

    return 0;
  };
  {
    /*play/pause */
  }
  const handleAutomaticReminderToggle = async (receivable) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {
      // setLoading(true);
      setError(null);
      setOpenDropdownId(null);
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
        details: receivable?.automatic_reminder
          ? `Les relances sont activés pour la relance ${receivable?.invoice_number}`
          : `Les relances sont en pause pour la relance ${receivable?.invoice_number}`,
      });
      fetchReceivables();
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
  const filteredReceivables = receivables
    .filter((receivable) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        receivable.client?.company_name.toLowerCase().includes(searchLower) ||
        receivable.invoice_number.toLowerCase().includes(searchLower) ||
        receivable.amount.toString().includes(searchLower)
      );
    })
    .sort(applySorting);
  const dropdownRefs = useRef({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const buttonRefs = useRef({});
  const tableRefs = useRef<HTMLTableElement | null>(null);

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (
      openDropdownId &&
      buttonRefs.current[openDropdownId] &&
      dropdownRefs.current[openDropdownId]
    ) {
      const buttonRect =
        buttonRefs.current[openDropdownId]!.getBoundingClientRect();
      const dropdown = dropdownRefs.current[openDropdownId];
      const table = tableRefs.current;

      if (!dropdown || !table) return;

      const dropdownHeight = dropdown.getBoundingClientRect().height;
      const tableHeight = table.offsetHeight;

      // const overflowHeight = dropdownTop + dropdownHeight - tableHeight;
      //alert(`Position de la souris : X=${mousePosition.x}, Y=${mousePosition.y},table height=${tableHeight}`);

      /*   if (mousePosition.y > tableHeight) {
      setDropdownPosition({
        top: buttonRect.top - dropdownHeight,
        left: buttonRect.left,
      });
    } else { */
      setDropdownPosition({
        top: buttonRect.top,
        left: buttonRect.left,
      });
      /*   }*/
    }
  }, [openDropdownId]);

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
      setSelectedIds(filteredReceivables.map((r) => r.id));
      setSelectedAll(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = dropdownRefs.current[openDropdownId];

      if (dropdown && !dropdown.contains(event.target)) {
        // Donne un court délai pour laisser les onClick internes s'exécuter
        setTimeout(() => {
          setOpenDropdownId(null);
        }, 50);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedIds([]);
        setSelectedAll(false);
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDropdownId]);
  const resolveStatus = (receivable) => {
    const { status, client } = receivable;

    const statusLevels = [
      { value: "Relance finale", enabled: client?.reminder_enable_final },
      { value: "Relance 3", enabled: client?.reminder_enable_3 },
      { value: "Relance 2", enabled: client?.reminder_enable_2 },
      { value: "Relance 1", enabled: client?.reminder_enable_1 },
      { value: "relanced", enabled: true },
    ];

    // Si préventive est désactivée, fallback vers "pending"
    if (
      status === "Relance préventive" &&
      client?.pre_reminder_enable === false
    ) {
      return "pending";
    }

    // Si le statut est une relance, on cherche le plus haut niveau activé
    const index = statusLevels.findIndex((s) => s.value === status);
    if (index !== -1) {
      for (let i = index; i < statusLevels.length; i++) {
        if (statusLevels[i].enabled) return statusLevels[i].value;
      }
      return "pending";
    }

    // Statut standard (non concerné par la logique de relance)
    return status;
  };
  function getReminderIssues(receivable) {
    const now = new Date();
    const issues: string[] = [];

    const client = receivable.client;
    if (!client) return "";

    if (client.pre_reminder_enable && !client.pre_reminder_template)
      issues.push("la pré-relance est activée sans template");

    if (client.reminder_enable_1 && !client.reminder_template_1)
      issues.push("la relance 1 est activée sans template");

    if (client.reminder_enable_2 && !client.reminder_template_2)
      issues.push("la relance 2 est activée sans template");

    if (client.reminder_enable_3 && !client.reminder_template_3)
      issues.push("la relance 3 est activée sans template");

    if (client.reminder_enable_final && !client.reminder_template_final)
      issues.push("la relance finale est activée sans template");

    const datesToCheck = [
      client.pre_reminder_enable && client.pre_reminder_date,
      client.reminder_enable_1 && client.reminder_date_1,
      client.reminder_enable_2 && client.reminder_date_2,
      client.reminder_enable_3 && client.reminder_date_3,
      client.reminder_enable_final && client.reminder_date_final,
    ];

    const hasPastDate = datesToCheck.some(
      (date) => date && isBefore(new Date(date), now)
    );

    /*     if (hasPastDate) {
      issues.push("une ou plusieurs dates de relance sont dépassées");
    } */

    if (!receivable.automatic_reminder && issues.length === 0) {
      return "Relance en pause";
    }

    return issues.join(", ");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <h1 className=" ml-4 text-2xl font-bold text-gray-900">Créances</h1>
          <Link to="/reminders" className="flex items-center h-16 px-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {/* <Upload className='h-5 w-5' /> */}
              Historique des relances
            </button>
          </Link>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Importer CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvelle créance
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {importSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          {importSuccess}
        </div>
      )}

      {sendSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Relance manuelle effectuée correctement !
        </div>
      )}
      <div className="ml-4 relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {selectedIds.length > 0 && (
        <div className="ml-4 mb-2 text-sm text-gray-700 flex items-center gap-3">
          {selectedIds.length}{" "}
          {selectedIds.length > 1
            ? "éléments sélectionnés"
            : "élément sélectionné"}{" "}
          <button
            type="button"
            onClick={handleBulkDeleteConfirmation}
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

      <div className="ml-4 bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y divide-gray-200"
            ref={tableRefs}
          >
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
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="client"
                    label="Client"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="client_code"
                    label="Code Client"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="email"
                    label="Email"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="invoice_number"
                    label="Facture"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="amount"
                    label="Montant"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="paid_amount"
                    label="Montant Réglé"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="document_date"
                    label="Date pièce"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="due_date"
                    label="Échéance"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="Delay in Days"
                    label="Retard"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="installment_number"
                    label="Numéro échéance"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortableColHead
                    colKey="status"
                    label="Statut"
                    onClick={(col: string) =>
                      handleSortOnClick(col as keyof CSVMapping)
                    }
                    selectedColKey={sortConfig?.key ?? ""}
                    sort={sortConfig?.sort ?? "none"}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commentaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceivables.map((receivable) => (
                <tr key={receivable.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(receivable.id)}
                      onChange={() => handleSelectRow(receivable.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <div className="flex  justify-start">
                      {/* Bouton menu déroulant */}
                      <div className="relative">
                        <div className="flex items-center gap-2 relative z-10">
                          <button className="flex items-start gap-1 text-gray-600 hover:text-gray-800">
                            {/* Icône MoreHorizontal - Reste toujours à droite */}
                            <Tooltip label="Options supplémentaires">
                              <span
                                ref={(el) =>
                                  (buttonRefs.current[receivable.id] = el)
                                }
                                className="w-5 h-5 flex items-center justify-center cursor-pointer"
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === receivable.id
                                      ? null
                                      : receivable.id
                                  )
                                }
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </span>
                            </Tooltip>


                            {/* play/pause  */}
                            <span
                              className={`w-5 h-5 flex items-center  ml-auto ${
                                !getReminderIssues(receivable) ? "ml-0" : ""
                              }`}
                              onClick={() => {
                                handleAutomaticReminderToggle(receivable);
                              }}
                            >
                              {receivable.automatic_reminder ? (
                                <Tooltip label="Mettre en pause" theme="green">
                                  <Pause
                                    className="cursor-pointer hover:fill-green-400 stroke-green-400"
                                    strokeWidth={2}
                                  />
                                </Tooltip>
                              ) : (
                                <Tooltip
                                  label="Activer les relances"
                                  theme="orange"
                                >
                                  <Play
                                    className="cursor-pointer hover:fill-orange-400 stroke-orange-400"
                                    strokeWidth={2}
                                  />
                                </Tooltip>
                              )}
                            </span>
                            
                            {/* Icône Info - Affichée seulement si getReminderIssues existe */}
                         
                            <Tooltip label={getReminderIssues(receivable)}>
                                <span className={getReminderIssues(receivable)?"text-yellow-500 w-5 h-5 flex items-center justify-center":"hidden"}>
                                  <Info className="h-5 w-5" />
                                </span>
                              </Tooltip>
                            
                          </button>
                        </div>

                        {openDropdownId === receivable.id && (
                          <div
                            ref={(el) =>
                              (dropdownRefs.current[receivable.id] = el)
                            }
                            className="fixed z-[51] w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-10 ml-2"
                            style={{
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`,
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setShowEditForm(true);
                                  setSelectedReceivable(receivable);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-2" /> Modifier
                              </button>
                              {receivable.status !== "paid" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedReceivable(receivable);
                                      setShowConfirmReminder(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-2 py-2 text-sm text-yellow-600 hover:bg-yellow-100"
                                  >
                                    <Mail className="w-4 h-4 mr-2" /> Envoyer
                                    une relance
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedClient(receivable.client);
                                  setSelectedReceivable(receivable);
                                  setShowSettings(true);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100"
                              >
                                <Clock className="w-4 h-4 mr-2 " /> Paramètres
                                de relance
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReceivable(receivable);
                                  setShowReminderHistory(true);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100"
                              >
                                <ListRestart className="w-4 h-4 mr-2" />{" "}
                                Historique des relances
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteClick(receivable);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-100"
                                ref={(el) =>
                                  (dropdownRefs.current[receivable.id] = el)
                                }
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receivable.client?.company_name ?? "Client inconnu"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receivable.client?.client_code ?? "inconnu"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receivable.email || receivable.client.email.split(",")[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receivable.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(receivable.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receivable.paid_amount
                      ? new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(receivable.paid_amount)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(receivable.document_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(receivable.due_date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dateDiff(new Date(receivable.due_date), new Date())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receivable.installment_number || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-1 items-center">
                    {/*jet status */}
                    <ReceivableStatusBadge receivable={receivable} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receivable.notes || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receivable.invoice_pdf_url ? (
                      <a
                        href={receivable.invoice_pdf_url}
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
                </tr>
              ))}
              {filteredReceivables.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Aucune créance trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ReceivableForm
          onClose={() => setShowForm(false)}
          onReceivableAdded={(receivable) => {
            setReceivables([receivable, ...receivables]);
            setShowForm(false);
          }}
        />
      )}

      {selectedReceivable && showEditForm && (
        <ReceivableEditForm
          receivable={selectedReceivable}
          onClose={() => {
            setShowEditForm(false);
            setSelectedReceivable(null);
          }}
          onReceivableUpdated={(updatedReceivable) => {
            setTimeout(() => {
              setReceivables(
                receivables.map((r) =>
                  r.id === updatedReceivable.id ? updatedReceivable : r
                )
              );
              setSelectedReceivable(null);
            }, 2000);
          }}
        />
      )}

      {showSettings && selectedClient && selectedReceivable && (
        <ReminderSettingsModal
          client={selectedClient}
          onClose={() => {
            setShowSettings(false);
            setSelectedClient(null);
            setSelectedReceivable(null);
            // Rafraîchir les données pour mettre à jour l'affichage des icônes d'avertissement
            fetchReceivables();
          }}
          reminderProfiles={reminderProfiles}
          receivable={selectedReceivable}
        />
      )}

      {showImportModal && (
        <CSVImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
          receivables={receivables}
        />
      )}

      {showConfirmSendReminder && selectedReceivable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmation d'envoi
              </h3>
              <button
                onClick={() => {
                  setShowConfirmReminder(false);
                  setSelectedReceivable(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir envoyer la relance manuelle ?
            </p>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Objet
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Entrez l'objet"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Entrez votre message"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="signature"
                  className="block text-sm font-medium text-gray-700"
                >
                  Signature
                </label>
                <textarea
                  id="signature"
                  name="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Entrez votre signature"
                ></textarea>
              </div>
            </form>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowConfirmReminder(false);
                  setSelectedReceivable(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                disabled={sending}
              >
                Annuler
              </button>
              <button
                onClick={handleSendReminder}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {sending ? "Envoi..." : "Envoyer la relance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && receivableToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmer la suppression
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setReceivableToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer la créance "
              {receivableToDelete.invoice_number}" pour le client "
              {receivableToDelete.client?.company_name || "inconnue"}" ? Cette
              action est irréversible.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setReceivableToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showReminderHistory && selectedReceivable && (
        <ReminderHistory
          receivableId={selectedReceivable?.id}
          reminders={reminderHistroy}
          onClose={handleOnClose}
        />
      )}
    </div>
  );
}

export default ReceivablesList;
