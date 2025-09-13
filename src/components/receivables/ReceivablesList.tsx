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
  PauseOctagon,
  MoreHorizontal,
  Play,
  PencilIcon,
  ChevronDown,
  Calendar,
  DollarSign,
  User,
  Tag,
  Key,
  Filter,
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
import { Link, useNavigate, useLocation } from "react-router-dom";
import { dateCompare, numberCompare, stringCompare } from "../../lib/comparers";
import SortableColHead from "../Common/SortableColHead";
import { dateDiff } from "../../lib/dateDiff";
import { saveNotification } from "../../lib/notification";
import Swal from "sweetalert2";
import { getReminderStatus } from "../../lib/function";
import { isBefore } from "date-fns";
import ReceivableStatusBadge from "./receivableStatusBadge";
import Tooltip from "../Common/Tooltip";

// Fonction utilitaire pour vérifier si des relances sont activées pour un client
function remindersEnabled(client: any): boolean {
  return (
    client.pre_reminder_enable ||
    client.reminder_enable_1 ||
    client.reminder_enable_2 ||
    client.reminder_enable_3 ||
    client.reminder_enable_final
  );
}

import PlaySvg from "../../components/images/play-svgrepo-com.svg";
import PauseSvg from "../../components/images/pause-svgrepo-com.svg";
import { motion, AnimatePresence } from "framer-motion";
import { log } from "console";
import { useAbonnement } from "../context/AbonnementContext";

type SortColumnConfig = {
  key: keyof CSVMapping | "client" | "email" | "Delay in Days";
  sort: "none" | "asc" | "desc";
};

function ReceivablesList() {
  const location = useLocation();
  const [sendError, setSendError] = useState(false);
  const { checkAbonnement } = useAbonnement();
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
  const [showFilters, setShowFilters] = useState(false);
  const RECEIVABLES_SORT_KEY = 'receivables_sort_config';
  const [sortConfig, setSortConfig] = useState<{
    key: "client";
    sort: "asc" | "desc";
  } | null>(() => {
    try {
      const saved = localStorage.getItem(RECEIVABLES_SORT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  // ... autres hooks d'état ici

  // Helper pour savoir si un profil de relance est prêt (profil pré-enregistré)
  function canPlayDirect(receivable: Receivable & { client: Client }) {
    const client = receivable.client;
    // Profil de relance enregistré + date pièce + date d'échéance présentes
    return (
      !!client?.reminder_profile &&
      !!receivable.document_date &&
      !!receivable.due_date
    );
  }


  const [hasConsumedReminderNavigation, setHasConsumedReminderNavigation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      location.state?.openReminderForClient &&
      receivables.length > 0 &&
      !hasConsumedReminderNavigation
    ) {
      const receivable = receivables.find(
        r => r.client.id === location.state.openReminderForClient
      );
      if (receivable) {
        setHasConsumedReminderNavigation(true); // Consomme le flag
        setSelectedReceivable(receivable);
        setShowConfirmReminder(true);
        // Vide l'état React Router pour éviter toute réouverture
        navigate("", { replace: true, state: null });
      }
    }
    // eslint-disable-next-line
  }, [location.state, receivables, hasConsumedReminderNavigation]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [receivableToDelete, setReceivableToDelete] = useState<
    (Receivable & { client: Client }) | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null); // déjà correct, rien à changer ici
  const [showReminderHistory, setShowReminderHistory] = useState(false);
  const [reminderHistroy, setReminderHistory] = useState<Reminder[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [reminderProfiles, setReminderProfiles] = useState<ReminderProfile[]>(
    []
  );
  const [reminderTitles, setReminderTitles] = useState<Record<string, string>>(
    {}
  );

  const handleClick = () => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
    return true;
  };

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

  const columnFilters = [
    { key: "status", label: "Statut" },
    { key: "client", label: "Client" },
    { key: "client_code", label: "Code Client" },
    { key: "amount", label: "Montant" },
    { key: "paid_amount", label: "Montant Réglé" },
    { key: "due_date", label: "Échéance" },
    { key: "Delay in Days", label: "Retard" },
    { key: "email", label: "Email" },
    { key: "invoice_number", label: "Facture" },
    { key: "document_date", label: "Date pièce" },
    { key: "installment_number", label: "N° Échéance" },
    { key: "notes", label: "Commentaire" },
  ];

  /*  const [columns, setColumns] = useState([
    { id: "select", label: "" },
    { id: "actions", label: "Actions" },
    { id: "status", label: "Statut" },
    { id: "client", label: "Client" },
    { id: "client_code", label: "Code Client" },
    { id: "email", label: "Email" },
    { id: "invoice_number", label: "Facture" },
    { id: "amount", label: "Montant" },
    { id: "paid_amount", label: "Réglé" },
    { id: "document_date", label: "Date pièce" },
    { id: "due_date", label: "Échéance" },
    { id: "delay", label: "Retard" },
    { id: "installment_number", label: "N° Échéance" },
    { id: "notes", label: "Commentaire" },
    { id: "invoice_pdf_url", label: "Invoice" },
  ]); */

  const getFilterIcon = (key: string) => {
    switch (key) {
      case "status":
        return <Info className="h-4 w-4" />;
      case "client":
        return <User className="h-4 w-4" />;
      case "client_code":
        return <Key className="h-4 w-4" />;
      case "amount":
        return <DollarSign className="h-4 w-4" />;
      case "paid_amount":
        return <DollarSign className="h-4 w-4" />;
      case "due_date":
        return <Calendar className="h-4 w-4" />;
      case "Delay in Days":
        return <Clock className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const fetchReceivables = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const userEmail = user.email;

      // 1. Récupère les IDs des utilisateurs qui ont invité l'utilisateur actuel
      const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

      if (invitedByError) throw invitedByError;

      const invitedByIds = invitedByData.map((entry) => entry.invited_by);

      // 2. Inclure l'utilisateur actuel dans les IDs à filtrer
      const allOwnerIds = [user.id, ...invitedByIds];

      // 3. Récupère les créances pour tous les IDs collectés
      const { data: receivablesData, error: receivablesError } = await supabase
        .from("receivables")
        .select("*, client:clients(*)")
        .in("owner_id", allOwnerIds)
        .order("due_date", { ascending: false });

      if (receivablesError) throw receivablesError;

      // 4. Profils de rappel
      const { data: reminderProfilesData, error: profilesError } =
        await supabase
          .from("reminder_profile")
          .select()
          .in("owner_id", allOwnerIds);

      if (profilesError) throw profilesError;

      setReminderProfiles(reminderProfilesData || []);
      setReceivables(receivablesData || []);

      // 5. Historique des rappels
      const { data: reminderHistoryData, error: historyError } = await supabase
        .from("reminders")
        .select("*")
        .order("reminder_date", { ascending: false });
      if (historyError) throw historyError;

      setReminderHistory(reminderHistoryData || []);
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
    const enableClientDelays = async () => {
      const { data: clientData, error } = await supabase
        .from("clients")
        .update({
          ...selectedReceivable?.client,
          reminder_enable_1: true,
          reminder_enable_2: true,
          reminder_enable_3: true,
        })
        .eq("id", selectedReceivable?.client?.id)
        .select()
        .single();
      // console.log("client data updated", clientData);
      if (error) throw error;
    };

    if (showConfirmSendReminder === true) {
      if (selectedReceivable?.client?.reminder_profile) {
        //    alert('selectedRecevable?.client?.reminder_profile: ',selectedReceivable?.client?.reminder_profile)
        enableClientDelays();
      }
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

        const isLastStatus = (status: string) => {
          const lastStatus = selectedReceivable.client?.reminder_enable_final
            ? "Relance finale"
            : selectedReceivable.client?.reminder_enable_3
            ? "Relance 3"
            : selectedReceivable.client?.reminder_enable_2
            ? "Relance 2"
            : selectedReceivable.client?.reminder_enable_1
            ? "Relance 1"
            : "Relance préventive";
          return status === lastStatus;
        };

        if (isLastStatus(selectedReceivable.status) === false) {
          //    alert("status: "+selectedReceivable.status+ "\nclient: "+selectedReceivable.client)
          // Déterminer le statut à utiliser pour la relance jet getnext
          let newStatus = getNextEnabledReminderStatus(
            selectedReceivable.status,
            selectedReceivable.client
          );
          //  alert("newStatus: "+newStatus)

          /*    if (!newStatus) { 

       showError("Vous n'avez pas encore configuré cette relance !");
        setSending(false);
        setShowConfirmReminder(false);
       setSelectedClient(null);
        return;
      } else{

      } */
          if (!newStatus) {
            newStatus = "pending";
          }
          await supabase
            .from("receivables")
            .update({
              status: newStatus,
            })
            .eq("id", selectedReceivable.id);
          //alert(newStatus);
          // Mettre à jour le statut avant l’envoi
          selectedReceivable.status = newStatus as any;
          // Récupérer le contenu et le niveau

          const result = await getReminderTemplate(
            selectedReceivable.id,
            newStatus
          );
          if (result) {
            const subjectLine = `Relance facture ${selectedReceivable.invoice_number}`;
            setSubject(subjectLine);
            setContent(result.template); // ou formatté si le template est déjà rempli
          }
        }
      };

      fetchData();
    }
  }, [selectedReceivable, showConfirmSendReminder]);

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
        .update({
          needs_reminder: needsReminder,
          reminder_date_1: null,
          reminder_date_2: null,
          reminder_date_3: null,
          reminder_date_final: null,
          pre_reminder_date: null,
          pre_reminder_enable: false,
          reminder_enable_1: false,
          reminder_enable_2: false,
          reminder_enable_3: false,
          reminder_enable_final: false,
          pre_reminder_template: null,
          reminder_template_1: null,
          reminder_template_2: null,
          reminder_template_3: null,
          reminder_template_final: null,
        })
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
      await updateClientReminderStatus(clientId, false);

      // Vérifier si le client a encore des créances impayées
      //  const noUnpaidReceivables = await checkClientUnpaidReceivables(clientId);

      /*     // Si le client n'a plus de créances impayées, désactiver les relances
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
                  reminder_date_1: null,
                  reminder_date_2: null,
                  reminder_date_3: null,
                  reminder_date_final: null,
                  pre_reminder_date: null,
                  pre_reminder_enable: false,
                  reminder_enable_1: false,
                  reminder_enable_2: false,
                  reminder_enable_3: false,
                  reminder_enable_final: false,
                  pre_reminder_template:"",
                  reminder_template_1:"",
                  reminder_template_2:"",
                  reminder_template_3:"",
                  reminder_template_final:""
                },
              };
            }
            return r;
          })
        );
      } */
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
      Swal.fire({
        title: "Supprimé !",
        text: "Les éléments sélectionnés ont été supprimés.",
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
  };
  //fonction récursive de détection de statut activé
  function getNextEnabledReminderStatus(
    status: string,
    client: {
      pre_reminder_enable?: boolean;
      reminder_enable_1?: boolean;
      reminder_enable_2?: boolean;
      reminder_enable_3?: boolean;
      reminder_enable_final?: boolean;
    }
  ): string | null {
    const allStatuses = [
      "pending",
      "Relance préventive",
      "Relance 1",
      "Relance 2",
      "Relance 3",
    ];

    const statusToFlag: Record<string, keyof typeof client> = {
      pending: "pre_reminder_enable",
      "Relance préventive": "reminder_enable_1",
      "Relance 1": "reminder_enable_2",
      "Relance 2": "reminder_enable_3",
      "Relance 3": "reminder_enable_final",
    };
    //alert(statusToFlag[currentStatus])
    let currentIndex = allStatuses.indexOf(status);
    while (currentIndex < allStatuses.length) {
      const currentStatus = allStatuses[currentIndex];
      const flag = statusToFlag[currentStatus];

      if (client?.[flag]) {
        return currentStatus;
      }
      currentIndex++;
    }

    return null; // Aucune relance activée trouvée
  }

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
          content || undefined
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
                need_mail_notification: true,
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
              need_mail_notification: true,
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
              need_mail_notification: true,
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
          need_mail_notification: true,
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
  const sendToSignatureSetting = () => {
    // alert("send")
    navigate("/settings", {
      state: { initialSectionId: "reminders", initialSubTabId: "sender" },
    });
  };

  const handleImportSuccess = async (importedCount: number) => {
    setImportSuccess(`${importedCount} créance(s) importée(s) avec succès`);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await saveNotification({
      owner_id: user?.id ?? "",
      need_mail_notification: true,
      is_read: false,
      type: "info",
      message: `importation de ${importedCount} créance(s)`,
      details: "",
    });
    fetchReceivables();
    setShowImportModal(false);
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
    let newConfig;
    if (sortConfig?.key === key) {
      newConfig = {
        ...sortConfig,
        sort: sortConfig.sort === "asc" ? "desc" : "asc",
      };
    } else {
      newConfig = {
        key,
        sort: "asc",
      };
    }
    setSortConfig(newConfig as any);
    try {
      localStorage.setItem(RECEIVABLES_SORT_KEY, JSON.stringify(newConfig));
    } catch {}
  };

  // Persist sortConfig changes (in case setSortConfig is called elsewhere)
  useEffect(() => {
    if (sortConfig) {
      try {
        localStorage.setItem(RECEIVABLES_SORT_KEY, JSON.stringify(sortConfig));
      } catch {}
    }
  }, [sortConfig]);

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

  const handleAutomaticReminderToggle = async (receivable: Receivable) => {
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
        owner_id: user?.id ?? "",
        need_mail_notification: true,
        is_read: false,
        type: "info",
        message: "Mise à jour des paramètres de relance automatique",
        details: receivable?.automatic_reminder
          ? `Les relances sont activés pour la facture ${receivable?.invoice_number}`
          : `Les relances sont en pause pour la facture ${receivable?.invoice_number}`,
      });
      fetchReceivables();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      if (user?.id) {
        await saveNotification({
          owner_id: user?.id,
          is_read: false,
          need_mail_notification: true,
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
  const dropdownRefs = useRef<Record<string, HTMLDivElement | HTMLSpanElement | null>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!openDropdownId) return;
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [openDropdownId]);
  const buttonRefs = useRef<Record<string, HTMLDivElement | HTMLSpanElement | null>>({});
  const tableRefs = useRef<HTMLTableElement | null>(null);
  const [reminder1AlreadySend, setReminder1AlreadySend] = useState(false);
  const [reminder2AlreadySend, setReminder2AlreadySend] = useState(false);
  const [reminder3AlreadySend, setReminder3AlreadySend] = useState(false);
  const [reminderFinalAlreadySend, setReminderFinalAlreadySend] =
    useState(false);
  const [preAlreadySend, setPreAlreadySend] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const filterRef = useRef(null);

  useEffect(() => {
    if (!showFilters) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !(filterRef.current as any).contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);
  /* 
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
    } else { 
      setDropdownPosition({
        top: buttonRect.top,
        left: buttonRect.left,
      });
      /*   }
    }
  }, [openDropdownId]); */

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

      if (!dropdown) return;

      /*  const dropdownHeight = dropdown.getBoundingClientRect().height;
      const tableHeight = table.offsetHeight;
 
        if (mousePosition.y > tableHeight) {
      setDropdownPosition({
        top: buttonRect.top - dropdownHeight,
        left: buttonRect.left,
      });
    } else { */
      setDropdownPosition({
        top: buttonRect.top,
        left: buttonRect.left,
      });
      //    }
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

  // Vérifie si un type de relance a déjà été envoyé
  const alreadySend = async (receivableId: string, reminderType: string) => {
    const { data, error } = await supabase
      .from("reminders")
      .select("id")
      .eq("receivable_id", receivableId)
      .eq("reminder_type", reminderType)
      .limit(1);
    if (error) {
      console.error("Erreur Supabase :", error);
      return false;
    }
    return data.length > 0;
  };

  // Vérifie et stocke l'état des relances déjà envoyées
  const fetchReminderStatus = async (receivableId: string) => {
    const pre = await alreadySend(receivableId, "pre");
    const first = await alreadySend(receivableId, "first");
    const second = await alreadySend(receivableId, "second");
    const third = await alreadySend(receivableId, "third");
    const final = await alreadySend(receivableId, "final");
    setPreAlreadySend(pre);
    setReminder1AlreadySend(first);
    setReminder2AlreadySend(second);
    setReminder3AlreadySend(third);
    setReminderFinalAlreadySend(final);
  };

  // Génère la description des problèmes détectés
  const detectIssues = (receivable: any) => {
    const now = new Date();
    const issues: string[] = [];

    const client = receivable.client || {};

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

    // Vérifier chaque relance individuellement
    if (
      client.pre_reminder_enable &&
      !preAlreadySend &&
      client.pre_reminder_date
    ) {
      // console.log(
      //   "client: ",
      //   client.company_name,
      //   " preAlreadySend:",
      //   preAlreadySend
      // );
      if (isBefore(new Date(client.pre_reminder_date), now)) {
        issues.push("La pré-relance est dépassée");
      }
    }

    if (
      client.reminder_enable_1 &&
      !reminder1AlreadySend &&
      client.reminder_date_1
    ) {
      if (isBefore(new Date(client.reminder_date_1), now)) {
        issues.push("La relance 1 est dépassée");
      }
    }

    if (
      client.reminder_enable_2 &&
      !reminder2AlreadySend &&
      client.reminder_date_2
    ) {
      // console.log("relance 2 already send:", reminder2AlreadySend);

      if (isBefore(new Date(client.reminder_date_2), now)) {
        issues.push("La relance 2 est dépassée");
      }
    }

    if (
      client.reminder_enable_3 &&
      !reminder3AlreadySend &&
      client.reminder_date_3
    ) {
      // console.log("relance 3 already send:", reminder3AlreadySend);

      if (isBefore(new Date(client.reminder_date_3), now)) {
        issues.push("La relance 3 est dépassée");
      }
    }

    if (
      client.reminder_enable_final &&
      !reminderFinalAlreadySend &&
      client.reminder_date_final
    ) {
      // console.log("relance final already send:", reminderFinalAlreadySend);

      if (isBefore(new Date(client.reminder_date_final), now)) {
        issues.push("La relance finale est dépassée");
      }
    }

    return issues.length > 0 ? issues.join(", ") : "";
  };

  // Effet principal

  useEffect(() => {
    const updateAllReminderStates = async () => {
      const titles: { [key: string]: any } = {}; // Ajout d'une signature d'index pour accès dynamique

      for (const receivable of receivables) {
        await fetchReminderStatus(receivable.id);
        const result = detectIssues(receivable);
        titles[receivable.id] = result;
      }

      setReminderTitles(titles);
    };

    if (receivables.length > 0) {
      updateAllReminderStates();
    }
  }, [receivables]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = openDropdownId !== null ? dropdownRefs.current[openDropdownId] : null;

      if (dropdown && !dropdown.contains(event.target as Node)) {
        // Donne un court délai pour laisser les onClick internes s'exécuter
        setTimeout(() => {
          setOpenDropdownId(null);
        }, 50);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
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

  const resolveStatus = (receivable: Receivable & { client: Client }) => {
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

  function getReminderIssues(receivable: Receivable & { client: Client }) {
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

    // Si un profil de relance existe et que la date pièce + échéance sont présentes, ne bloque pas
    if (
      !client.reminder_enable_1 &&
      !client.reminder_enable_2 &&
      !client.reminder_enable_3 &&
      !client.reminder_enable_final &&
      !client.pre_reminder_enable
    ) {
      if (client.reminder_profile && receivable.document_date && receivable.due_date) {
        return ""; // Pas de blocage
      }
      return "Aucune relance n'est activée!";
    }
/*     if (!receivable.automatic_reminder && issues.length === 0) {
      return "Relance en pause";
    } */

    return issues.join(", ");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  function renderCell(key: string, r: any) {
    switch (key) {
      case "status":
        return <ReceivableStatusBadge receivable={r} />;
      case "client":
        return r.client?.company_name ?? "Inconnu";
      case "client_code":
        return r.client?.client_code ?? "Inconnu";
      case "email":
        return r.email || r.client.email.split(",")[0];
      case "invoice_number":
        return r.invoice_number;
      case "amount":
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(r.amount);
      default:
        return "-";
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <h1 className=" ml-4 text-2xl font-bold text-gray-900">Créances</h1>
          <Link to="/reminders" className="flex items-center h-16 px-4">
            <button
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              <Clock className="h-5 w-5" />
              {/* <Upload className='h-5 w-5' /> */}
              Historique des relances
            </button>
          </Link>
        </div>
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const allowed = handleClick();
              if (!allowed) return;
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-green-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            <Upload className="h-5 w-5" />
            Importer CSV
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const allowed = handleClick();
              if (!allowed) return;
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
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

      <div className="space-y-4 ml-4">
        {/* Barre de recherche */}
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Sélection actuelle */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex left-3 items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2.5 mb-2 shadow-sm"
          >
            <span className="text-sm text-gray-700">
              {selectedIds.length}{" "}
              {selectedIds.length > 1
                ? "éléments sélectionnés"
                : "élément sélectionné"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const allowed = handleClick();
                if (!allowed) return;
                handleBulkDeleteConfirmation();
              }}
              disabled={selectedIds.length === 0}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-white font-medium transition
        ${
          selectedIds.length === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </motion.div>
        )}

        {/* Section de filtres */}
        <div
          className="relative"
          style={{ marginBottom: "4vh" }}
          ref={filterRef}
        >
          {/* Section de tris */}
          <div className="relative" style={{ marginBottom: "4vh" }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              {showFilters ? (
                <>
                  <X className="h-5 w-5" />
                  <span>Masquer les tris</span>
                </>
              ) : (
                <>
                  <Filter className="h-5 w-5" />
                  <span>Afficher les tris</span>
                </>
              )}
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute z-10 mt-3 rounded-md border border-gray-200 bg-white shadow-lg p-4 w-fit min-w-[200px]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {columnFilters.map((col) => {
                      const isActive = sortConfig?.key === col.key;
                      const isAsc = isActive && sortConfig.sort === "asc";

                      return (
                        <button
                          key={col.key}
                          onClick={() => handleSortOnClick(col.key as keyof CSVMapping | "Delay in Days")}
                          className={`
                          relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                          backdrop-blur-sm
                          border border-opacity-30
                          transition-all duration-300 ease-in-out transform
                          
                          ${
                            isActive
                              ? isAsc
                                ? "bg-blue-500/20 text-blue-800 border-blue-400/50 shadow-md"
                                : "bg-red-500/20 text-red-800 border-red-400/50 shadow-md"
                              : "bg-gray-100/30 text-gray-700 border-gray-300/50 hover:bg-gray-200/40"
                          }

                          hover:scale-[1.02] hover:shadow-lg
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${
                            isActive
                              ? isAsc
                                ? "focus:ring-blue-300"
                                : "focus:ring-red-300"
                              : "focus:ring-gray-400"
                          }
                        `}
                        >
                          <span className="relative z-10 flex items-center gap-1.5">
                            {getFilterIcon(col.key)}
                            <span>{col.label}</span>
                          </span>

                          {isActive && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${
                                isAsc ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-800 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      title="Tout sélectionner"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Actions</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Code Client</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Facture</th>
                  <th className="px-4 py-3 text-left">Montant</th>
                  <th className="px-4 py-3 text-left">Réglé</th>
                  <th className="px-4 py-3 text-left">Date pièce</th>
                  <th className="px-4 py-3 text-left">Échéance</th>
                  <th className="px-4 py-3 text-left">Retard</th>
                  <th className="px-4 py-3 text-left">N° Échéance</th>
                  <th className="px-4 py-3 text-left">Commentaire</th>
                  <th className="px-4 py-3 text-left">Invoice</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {filteredReceivables.map((receivable) => (
                  <tr
                    key={receivable.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(receivable.id)}
                        onChange={() => handleSelectRow(receivable.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 relative">
                      <div className="flex gap-2 items-center relative z-0">
                        <Tooltip label="Options supplémentaires">
                          <span
                            ref={(el) =>
                              (buttonRefs.current[receivable.id] = el)
                            }
                            className="w-6 h-6 flex items-center justify-center cursor-pointer relative z-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!handleClick()) return;
                              setOpenDropdownId(
                                openDropdownId === receivable.id
                                  ? null
                                  : receivable.id
                              );
                            }}
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                          </span>
                        </Tooltip>

                        
<span
  className={`w-6 h-6 flex items-center justify-center relative z-0 ${!remindersEnabled(receivable.client) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  onClick={e => {
    e.stopPropagation();
    if (!remindersEnabled(receivable.client)) return;
    if (!handleClick()) return;
    handleAutomaticReminderToggle(receivable);
  }}
  aria-disabled={!remindersEnabled(receivable.client)}
>
  <AnimatePresence mode="wait" initial={false}>
    {!receivable.automatic_reminder ? (
      <Tooltip
        label={remindersEnabled(receivable.client) ? 'Activer les relances' : "Aucune relance n'est activée pour ce client"}
        theme="orange"
        key="play"
      >
        <button
          type="button"
          className={`flex items-center justify-center rounded-full w-8 h-8 transition focus:outline-none ${remindersEnabled(receivable.client) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
          disabled={!remindersEnabled(receivable.client)}
          aria-label="Activer les relances"
          style={{ fontSize: '1.2rem' }}
        >
          <motion.span
            key="play-icon"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.09 }}
            style={{ fontWeight: 'bold', fontFamily: 'inherit', fontSize: '1.3rem', marginLeft: '2px' }}
          >
            ▶
          </motion.span>
        </button>
      </Tooltip>
    ) : (
      <Tooltip label="Mettre en pause" theme="green" key="pause">
        <button
          type="button"
          className="flex items-center justify-center rounded-full w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white transition focus:outline-none"
          aria-label="Mettre en pause"
          style={{ fontSize: '1.2rem' }}
        >
          <motion.span
            key="pause-icon"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.09 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '1.3rem', width: '1.3rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="3" width="3" height="12" rx="1.2" fill="currentColor" />
              <rect x="11" y="3" width="3" height="12" rx="1.2" fill="currentColor" />
            </svg>
          </motion.span>
        </button>
      </Tooltip>
    )}
  </AnimatePresence>
</span>


                        {getReminderIssues(receivable) && (
                          <Tooltip label={getReminderIssues(receivable) }>
                            <Info className="w-5 h-5 text-yellow-500 relative z-0" />
                          </Tooltip>
                        )}
                      </div>

                      {/* Dropdown */}
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
                              className="flex  w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4 mr-2" /> Modifier
                            </button>
                            {receivable.status !== "paid" && (
                              <button
                                onClick={() => {
                                  setSelectedReceivable(receivable);
                                  setShowConfirmReminder(true);
                                  setOpenDropdownId(null);
                                }}
                                className="flex  w-full px-2 py-2 text-sm text-yellow-600 hover:bg-yellow-100"
                              >
                                <Mail className="w-4 h-4 mr-2" /> Envoyer une
                                relance
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedClient(receivable.client);
                                setSelectedReceivable(receivable);
                                setShowSettings(true);
                                setOpenDropdownId(null);
                              }}
                              className="flex  w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100"
                            >
                              <Clock className="w-4 h-4 mr-2" /> Paramètres de
                              relance
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReceivable(receivable);
                                setShowReminderHistory(true);
                                setOpenDropdownId(null);
                              }}
                              className="flex  w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100"
                            >
                              <ListRestart className="w-4 h-4 mr-2" />{" "}
                              Historique des relances
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteClick(receivable);
                                setOpenDropdownId(null);
                              }}
                              className="flex  w-full px-2 py-2 text-sm text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Données */}
                    <td className="px-4 py-3">
                      <ReceivableStatusBadge receivable={receivable} />
                    </td>
                    <td className="px-4 py-3">
                      {receivable.client?.company_name ?? "Client inconnu"}
                    </td>
                    <td className="px-4 py-3">
                      {receivable.client?.client_code ?? "inconnu"}
                    </td>
                    <td className="px-4 py-3">
                      {receivable.email ||
                        receivable.client.email.split(",")[0]}
                    </td>
                    <td className="px-4 py-3">{receivable.invoice_number}</td>
                    <td className="px-4 py-3">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(receivable.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {receivable.paid_amount
                        ? new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(receivable.paid_amount)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(receivable.document_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(receivable.due_date).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {Math.max(
                        0,
                        dateDiff(new Date(receivable.due_date), new Date())
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {receivable.installment_number || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {receivable.notes || "-"}
                    </td>
                    <td className="px-4 py-3">
  {receivable.invoice_pdf_url ? (
    <a
      href={receivable.invoice_pdf_url}
      target="_blank"
      rel="noopener noreferrer"
      title="Voir la facture"
      className="text-blue-600 hover:text-blue-800"
    >
      <File className="w-5 h-5" />
    </a>
  ) : (
    "-"
  )}
</td>
                  </tr>
                ))}
                {filteredReceivables.length === 0 && (
                  <tr>
                    <td colSpan={15} className="text-center py-6 text-gray-500">
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
            onClose={() => {
  console.log('setShowForm(false) appelé');
  setShowForm(false);
}}
            onReceivableAdded={(receivable) => {
              setReceivables([receivable, ...receivables]);
              setShowForm(false);
              navigate('/receivables');
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
            open={showSettings}
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
            fetchReceivables();
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
                <div className="mb-4">
                  <label
                    htmlFor="signature"
                    className="hidden block text-sm font-medium text-gray-700"
                  >
                    Signature (HTML)
                  </label>
                  <textarea
                    id="signature"
                    name="signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    rows={6}
                    className="hidden mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Entrez votre signature HTML"
                  ></textarea>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Aperçu de la signature :
                    </label>
                    <button
                      onClick={sendToSignatureSetting}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Personnaliser la signature"
                      type="button"
                    >
                      <PencilIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                      Modifier
                    </button>
                  </div>
                  <div
                    className="border p-4 rounded bg-white shadow"
                    dangerouslySetInnerHTML={{ __html: signature }}
                  />
                </div>
              </form>

      {sendError && (
        <div className="mt-4 text-red-600 text-sm font-medium">
          Une erreur est survenue lors de l'envoi de la relance. Veuillez réessayer.
        </div>
      )}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    // Nettoyage supplémentaire de l'état de navigation lors de la fermeture manuelle de la popup
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setShowConfirmReminder(false);
                    setSelectedReceivable(null);
                    fetchReceivables();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                  disabled={sending}
                >
                  Annuler
                </button>
                <button
          onClick={async () => {
            setSendError(false);
            setSendSuccess(false);
            await handleSendReminder();
            setSendSuccess(true);
            setShowConfirmReminder(false);
            setSelectedReceivable(null);
            fetchReceivables();
                  }}
                  disabled={sending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {sending ? "Envoi..." : "Envoyer la relance"}
                </button>
              </div>
            </div>
          </div>
        )}
{sendSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 flex flex-col items-center">
      <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Relance envoyée avec succès !</h3>
      <button
        onClick={() => setSendSuccess(false)}
        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
      >
        Fermer
      </button>
    </div>
  </div>
) }

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
        <style>
          {`
          [data-framer-motion-layout-id="activeTab"] {
            transition: all 0.3s ease-in-out;
          }
        `}
        </style>
      </div>
    </div>
  );
}

export default ReceivablesList;
