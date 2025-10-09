'use client;'
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { supabase } from "../../src/lib/supabase/supabase";
import { Client, ReminderProfile } from "../../src/types/database";
import {
  Search,
  Edit,
  Trash2,
  X,
  Info,
  MoreHorizontal,
  ChevronDown,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  User,
  Tag,
  Key,
} from "lucide-react";
import ClientForm from "../ClientForm";
import CSVImportModal, { CSVMapping } from "./CSVImportModal";
import SortableColHead from "../Common/SortableColHead";
import {
  booleanCompare,
  dateCompare,
  stringCompare,
} from "../../src/lib/comparers";
import Swal from "sweetalert2";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import Link from "next/link";

type ClientListProps = {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  setError: (error: string | null) => void;
  setImportSuccess: (message: string | null) => void;
  importSuccess: string | null;
  assignProfileId?: string[] | string | undefined;
};

type SortColumnConfig = {
  key: keyof CSVMapping;
  sort: "none" | "asc" | "desc";
};

function ClientList({
  showForm,
  setShowForm,
  showImportModal,
  setShowImportModal,
  setError,
  importSuccess,
  setImportSuccess,
  assignProfileId,
}: ClientListProps) {
  const [clients, setClients] = useState<
    (Client & { reminderProfile?: ReminderProfile })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const CLIENTS_SORT_KEY = 'clients_sort_config';
  const [sortConfig, setSortConfig] = useState<SortColumnConfig | null>(() => {
    try {
      const saved = localStorage.getItem(CLIENTS_SORT_KEY);
      return saved ? JSON.parse(saved) : { key: "company_name", sort: "asc" };
    } catch {
      return { key: "company_name", sort: "asc" };
    }
  });

  // Persist sortConfig changes (in case setSortConfig is called elsewhere)
  useEffect(() => {
    if (sortConfig) {
      try {
        localStorage.setItem(CLIENTS_SORT_KEY, JSON.stringify(sortConfig));
      } catch { }
    }
  }, [sortConfig]);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [reminderProfiles, setReminderProfiles] = useState<ReminderProfile[]>([]);
  const [profileUpdating, setProfileUpdating] = useState<Record<string, boolean>>({});
  const assignProfile = (assignProfileId
    ? reminderProfiles.find((rp) => (rp.id as string) === assignProfileId)
    : undefined) || null;

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  /*   const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  }; */
  const fetchClients = async () => {
    try {
      const response = await fetch("api/clients", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })

      const { clients: clientsData, error: clientsError } = await response.json();

      if (clientsError) throw clientsError;

      setClients(clientsData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      showError("Impossible de charger la liste des clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Charger les profils de rappel de l'utilisateur
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('reminder_profile')
          .select('*')
          .eq('owner_id', user.id)
          .eq('public', false)
          .order('name');
        if (error) throw error;
        setReminderProfiles(data || []);
      } catch (e) {
        console.error('Erreur lors du chargement des profils de relance:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (importSuccess) {
      const timer = setTimeout(() => {
        setImportSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importSuccess]);
  const dropdownRefs = useRef<Record<string, HTMLElement | null>>({});
  const filterRef = useRef<HTMLDivElement | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openDropdownId) return;
      const dropdown = dropdownRefs.current[openDropdownId];
      const trigger = buttonRefs.current[openDropdownId];

      const target = event.target as Node;
      const clickedInsideDropdown = dropdown ? dropdown.contains(target) : false;
      const clickedOnTrigger = trigger ? trigger.contains(target) : false;

      if (!clickedInsideDropdown && !clickedOnTrigger) {
        // Donne un court délai pour laisser les onClick internes s'exécuter
        setTimeout(() => {
          setOpenDropdownId(null);
        }, 50);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedClientIds([]);

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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refEl = filterRef.current;
      if (refEl && !refEl.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const buttonRefs = useRef<Record<string, HTMLElement | null>>({});
  const tableRefs = useRef<HTMLTableElement | null>(null);

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const btnEl = openDropdownId ? buttonRefs.current[openDropdownId] : null;
    const dropEl = openDropdownId ? dropdownRefs.current[openDropdownId] : null;
    if (openDropdownId && btnEl && dropEl) {
      const buttonRect = btnEl.getBoundingClientRect();
      const dropdown = dropEl;
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

  const columnFilters: { key: keyof CSVMapping; label: string }[] = [
    { key: "needs_reminder", label: "Relance" },
    { key: "company_name", label: "Entreprise" },
    { key: "client_code", label: "Code Client" },
    { key: "address", label: "Adresse" },
    { key: "phone", label: "Téléphone" },
    { key: "postal_code", label: "Code postale" },
    { key: "created_at", label: "Créé le" },
    { key: "updated_at", label: "Mis à jour" },
  ];

  const getFilterIcon = (key: string) => {
    switch (key) {
      case "needs_reminder":
        return <Info className="h-4 w-4" />;
      case "company_name":
        return <User className="h-4 w-4" />;
      case "client_code":
        return <Key className="h-4 w-4" />;
      case "created_at":
        return <Calendar className="h-4 w-4" />;
      case "updated_at":
        return <Clock className="h-4 w-4" />;
      case "amount":
        return <DollarSign className="h-4 w-4" />;
      case "paid_amount":
        return <DollarSign className="h-4 w-4" />;
      case "due_date":
        return <Calendar className="h-4 w-4" />;
      case "delay_in_days":
        return <Clock className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      setDeleting(true);
      setError(null);
      const { error: receivablesError } = await supabase
        .from("receivables")
        .delete()
        .eq("client_id", clientToDelete.id);

      if (receivablesError) throw receivablesError;

      const { error: clientError } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id);

      if (clientError) throw clientError;

      setClients(clients.filter((c) => c.id !== clientToDelete.id));
      setShowDeleteConfirm(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      showError("Impossible de supprimer le client");
    } finally {
      setDeleting(false);
    }
  };

  const handleImportSuccess = (importedCount: number) => {
    setImportSuccess(`${importedCount} client(s) importé(s) avec succès`);
    fetchClients();
    setShowImportModal(false);
  };

  const handleMouseEnter = (clientId: string) => {
    setTooltipVisible(clientId);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };
  const handleBulkDeleteConfirmation = async () => {
    // Confirmation avant la suppression
    const result = await Swal.fire({
      title: "Es-tu sûr ?",
      text: "Cette action supprimera tous les clients sélectionnés. Cette action est irréversible !",
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
      await handleBulkDelete();
      Swal.fire({
        title: "Supprimé !",
        text: "Les clients sélectionnés ont été supprimés.",
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

  const handleBulkDelete = async () => {
    try {
      const { error: receivablesError } = await supabase
        .from("receivables")
        .delete()
        .in("client_id", selectedClientIds);

      if (receivablesError) throw receivablesError;
      // Suppression des clients via Supabase
      const { data, error } = await supabase
        .from("clients")
        .delete()
        .in("id", selectedClientIds);

      if (error) {
        throw new Error(error.message);
      }

      // Par exemple, filtrer les clients supprimés de la liste affichée
      console.log("Clients supprimés:", data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Swal.fire("Erreur", `Une erreur est survenue : ${message}`, "error");
    }
    setSelectedClientIds([]);
    //setSelectedAll(false);
    fetchClients(); // ou ta méthode de rafraîchissement
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatEmail = (emails: string) => {
    const splitMail = emails.split(",");
    return splitMail.length > 1 ? `${splitMail[0]}...` : splitMail[0];
  };

  const handleSortOnClick = (key: keyof CSVMapping) => {
    let newConfig: SortColumnConfig;
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
    setSortConfig(newConfig);
    try {
      localStorage.setItem(CLIENTS_SORT_KEY, JSON.stringify(newConfig));
    } catch { }
  };

  const applySorting = (
    a: Client & { reminderProfile?: ReminderProfile },
    b: Client & { reminderProfile?: ReminderProfile }
  ) => {
    if (!sortConfig) return 0;
    const { key, sort } = sortConfig;

    if (key === "company_name") {
      return stringCompare(a.company_name, b.company_name, sort);
    }
    if (key === "client_code") {
      return stringCompare(a.client_code, b.client_code, sort);
    }
    if (key === "email") {
      return stringCompare(a.email, b.email, sort);
    }
    if (key === "phone") {
      return stringCompare(a.phone, b.phone, sort);
    }
    if (key === "address") {
      return stringCompare(a.address, b.address, sort);
    }
    if (key === "city") {
      return stringCompare(a.city, b.city, sort);
    }
    if (key === "postal_code") {
      return stringCompare(a.postal_code, b.postal_code, sort);
    }
    if (key === "country") {
      return stringCompare(a.country, b.country, sort);
    }
    if (key === "industry") {
      return stringCompare(a.industry, b.industry, sort);
    }
    if (key === "reminderProfile") {
      return stringCompare(
        a.reminderProfile?.name,
        b.reminderProfile?.name,
        sort
      );
    }

    if (key === "website") {
      return stringCompare(a.website, b.website, sort);
    }
    if (key === "needs_reminder") {
      return booleanCompare(a.needs_reminder, b.needs_reminder, sort);
    }
    if (key === "created_at") {
      return dateCompare(a.created_at, b.created_at, sort);
    }
    if (key === "updated_at") {
      return dateCompare(a.updated_at, b.updated_at, sort);
    }
    if (key === "comment") {
      return stringCompare(a.notes, b.notes, sort);
    }

    return 0;
  };

  // Assignation en masse du profil sélectionné via le mode assignation
  const handleBulkAssignProfile = async (profile: ReminderProfile) => {
    if (!profile || selectedClientIds.length === 0) return;
    try {
      setError(null);
      const updatePayload: any = {
        reminder_profile: profile.id,
      };
      if (profile.delay1) updatePayload.reminder_delay_1 = profile.delay1;
      if (profile.delay2) updatePayload.reminder_delay_2 = profile.delay2;
      if (profile.delay3) updatePayload.reminder_delay_3 = profile.delay3;
      if (profile.delay4) updatePayload.reminder_delay_final = profile.delay4;
      if (profile.email_template_1) updatePayload.reminder_template_1 = profile.email_template_1;
      if (profile.email_template_2) updatePayload.reminder_template_2 = profile.email_template_2;
      if (profile.email_template_3) updatePayload.reminder_template_3 = profile.email_template_3;
      if (profile.email_template_4) updatePayload.reminder_template_final = profile.email_template_4;

      const { error } = await supabase
        .from('clients')
        .update(updatePayload)
        .in('id', selectedClientIds);
      if (error) throw error;

      // MAJ locale des clients
      setClients((prev) => prev.map((c) => (
        selectedClientIds.includes(c.id)
          ? { ...c, reminderProfile: profile }
          : c
      )));

      setSelectedClientIds([]);
    } catch (e) {
      console.error('Erreur assignation du profil:', e);
      showError("Impossible d'assigner le profil");
    }
  };

  // Changement inline du profil de rappel pour un client
  const handleInlineProfileChange = async (
    clientRow: Client & { reminderProfile?: ReminderProfile },
    profileId: string
  ) => {
    try {
      setProfileUpdating((prev) => ({ ...prev, [clientRow.id]: true }));
      // Si aucun profil sélectionné → seulement déréférencer le profil
      if (!profileId) {
        const { error } = await supabase
          .from('clients')
          .update({ reminder_profile: null })
          .eq('id', clientRow.id);
        if (error) throw error;
        // Mettre à jour l'état local
        setClients((prev) => prev.map((c) => c.id === clientRow.id ? { ...c, reminderProfile: undefined } : c));
        return;
      }

      // Trouver le profil sélectionné
      const selected = reminderProfiles.find((p) => (p.id as string) === profileId);
      if (!selected) return;

      // Construire la payload de mise à jour: pointer le profil et appliquer délais/templates si fournis
      const updatePayload: any = {
        reminder_profile: profileId,
      };
      if (selected.delay1) updatePayload.reminder_delay_1 = selected.delay1;
      if (selected.delay2) updatePayload.reminder_delay_2 = selected.delay2;
      if (selected.delay3) updatePayload.reminder_delay_3 = selected.delay3;
      if (selected.delay4) updatePayload.reminder_delay_final = selected.delay4;
      if (selected.email_template_1) updatePayload.reminder_template_1 = selected.email_template_1;
      if (selected.email_template_2) updatePayload.reminder_template_2 = selected.email_template_2;
      if (selected.email_template_3) updatePayload.reminder_template_3 = selected.email_template_3;
      if (selected.email_template_4) updatePayload.reminder_template_final = selected.email_template_4;

      const { error } = await supabase
        .from('clients')
        .update(updatePayload)
        .eq('id', clientRow.id);
      if (error) throw error;

      // Mettre à jour l'état local: changer le nom du profil affiché
      setClients((prev) => prev.map((c) => c.id === clientRow.id ? { ...c, reminderProfile: selected } : c));
    } catch (e) {
      console.error('Erreur lors de la mise à jour du profil de rappel:', e);
      showError("Impossible de mettre à jour le profil de rappel");
    } finally {
      setProfileUpdating((prev) => ({ ...prev, [clientRow.id]: false }));
    }
  };

  const filteredClients = clients
    .filter((client) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        client.email.toLowerCase().includes(searchLower) ||
        client.company_name.toLowerCase().includes(searchLower) ||
        (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
        (client.city && client.city.toLowerCase().includes(searchLower))
      );
    })
    .sort(applySorting);

  return (
    <>
      <div className="ml-4 relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {assignProfile && (
        <div className="ml-4 mb-3 px-4 py-2 rounded-md border border-blue-200 bg-blue-50 text-sm text-blue-800 flex items-center justify-between w-[99%]">
          <span>Mode d'assignation actif — Profil: <strong>{assignProfile.name}</strong>. Sélectionnez des clients puis cliquez sur "Assigner".</span>
          <Link
            type="button"
            className="text-blue-700 hover:text-blue-900 underline"
            href={'/clients'}
          >
            Quitter
          </Link>
        </div>
      )}
      {selectedClientIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex w-[99%] ml-4 items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2.5 mb-2 shadow-sm"
        >
          {selectedClientIds.length} client(s) sélectionné(s)
          <button
            type="button"
            onClick={() => {
              handleBulkDeleteConfirmation();
            }}
            disabled={selectedClientIds.length === 0}
            className={`ml-2 px-4 py-1.5 rounded-lg text-white font-semibold transition-colors duration-200 ${selectedClientIds.length === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-200"
              }`}
          >
            Supprimer la sélection
          </button>
          {assignProfile && (
            <button
              type="button"
              onClick={() => handleBulkAssignProfile(assignProfile)}
              disabled={selectedClientIds.length === 0}
              className={`ml-2 px-4 py-1.5 rounded-lg text-white font-semibold transition-colors duration-200 ${selectedClientIds.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              Assigner le profil "{assignProfile.name}"
            </button>
          )}
        </motion.div>
      )}

      <div className="ml-4 overflow-hidden">
        <div
          className="relative"
          style={{ marginBottom: "4vh" }}
          ref={filterRef}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            {showFilters ? (
              <>
                <X className="h-5 w-5" />
                <span>Masquer les tris</span>{" "}
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
                      <motion.button
                        key={col.key}
                        onClick={() => handleSortOnClick(col.key)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        className={`
                    relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
                    backdrop-blur-sm border border-opacity-30
                    transition-all duration-300 ease-in-out transform
                    
                    ${isActive
                            ? isAsc
                              ? "bg-blue-500/20 text-blue-800 border-blue-400/50 shadow-md"
                              : "bg-red-500/20 text-red-800 border-red-400/50 shadow-md"
                            : "bg-gray-100/30 text-gray-700 border-gray-300/50 hover:bg-gray-200/40"
                          }

                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isActive
                            ? isAsc
                              ? "focus:ring-blue-300"
                              : "focus:ring-red-300"
                            : "focus:ring-gray-400"
                          }
                  `}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {" "}
                          {getFilterIcon(col.key)}
                          <span>{col.label}</span>
                        </span>

                        {isActive && (
                          <motion.span
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isAsc ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                            className="relative z-10"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.span>
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="activeFilterTab"
                            className={`absolute inset-0 rounded-lg ${isAsc ? "bg-blue-500/15" : "bg-red-500/15"
                              }`}
                            style={{ zIndex: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-800 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedClientIds.length === filteredClients.length &&
                      filteredClients.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClientIds(
                          filteredClients.map((client) => client.id)
                        );
                      } else {
                        setSelectedClientIds([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    title="Tout sélectionner"
                  />
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Profil de rappel
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Relance

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wide">
                  Entreprise

                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Code Client
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Téléphone

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Adresse
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Code postal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Pays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Site web
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Mis à jour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Commentaire
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedClientIds.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClientIds((prev) => [...prev, client.id]);
                        } else {
                          setSelectedClientIds((prev) =>
                            prev.filter((id) => id !== client.id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap relative"
                    style={{ maxWidth: "80px" }}
                  >
                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === client.id ? null : client.id
                          )
                        }
                        ref={(el) => {
                          buttonRefs.current[client.id] = el;
                        }}
                        className="text-gray-600 hover:text-gray-800 "
                        title="Actions"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {openDropdownId === client.id && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          ref={(el) => {
                            dropdownRefs.current[client.id] = el;
                          }}
                          className="fixed z-[51] w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-10 ml-2"
                          style={{
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                          }}
                        >
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClient(client);
                                setShowForm(true);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center w-full px-2 py-2 text-sm text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4 mr-2" /> Modifier
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(client);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    style={{ maxWidth: "140px" }}
                  >
                    <div className="flex items-center gap-1">
                      <select
                        value={client.reminderProfile?.id ?? ''}
                        onChange={(e) => handleInlineProfileChange(client as Client & { reminderProfile?: ReminderProfile }, e.target.value)}
                        className="w-28 px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Ne pas utiliser de profil</option>
                        {reminderProfiles.map((rp) => (
                          <option key={rp.id as string} value={rp.id as string}>{rp.name}</option>
                        ))}
                      </select>
                      {profileUpdating[client.id] && (
                        <span className="text-xs text-gray-500">Sauvegarde...</span>
                      )}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ maxWidth: "80px" }}
                  >
                    <div className="flex items-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.needs_reminder
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                          }`}
                      >
                        {client.needs_reminder ? "Oui" : "Non"}
                      </span>
                      {client.needs_reminder && !client.reminder_template_1 && (
                        <div className="relative ml-2">
                          <div
                            className="text-yellow-500 cursor-help"
                            onMouseEnter={() => handleMouseEnter(client.id)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <Info className="h-4 w-4" />
                          </div>
                          {tooltipVisible === client.id && (
                            <div className="absolute z-10 w-64 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm -left-32 bottom-full mb-1">
                              Paramètres de relance non configurés. Veuillez
                              configurer les modèles de relance pour ce client.
                              <div
                                className="tooltip-arrow"
                                data-popper-arrow
                              ></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.client_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatEmail(client.email)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.address || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.city || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.postal_code || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.country || "France"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.industry || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.website ? (
                      <a
                        href={
                          client.website.startsWith("http")
                            ? client.website
                            : `https://${client.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {client.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(client.updated_at)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.notes}
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="px-6 py-4 text-center text-gray-900"
                  >
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ClientForm
          onClose={() => {
            setShowForm(false);
            setSelectedClient(null);
          }}
          onClientAdded={(client) => {
            setClients([client, ...clients]);
            setShowForm(false);
            fetchClients();
          }}
          onClientUpdated={(updatedClient) => {
            setClients(
              clients.map((c) =>
                c.id === updatedClient.id ? { ...c, ...updatedClient } : c
              )
            );
            setShowForm(false);
            setSelectedClient(null);
            //      showSuccess("Client modifié correctement")
            fetchClients();
          }}
          client={selectedClient ?? undefined}
          mode={selectedClient ? "edit" : "create"}
        />
      )}

      {showDeleteConfirm && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmer la suppression
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setClientToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-900 mb-4">
              Êtes-vous sûr de vouloir supprimer le client "
              {clientToDelete.company_name}" ? Cette action supprimera également
              toutes les créances et relances associées.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setClientToDelete(null);
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

      {showImportModal && (
        <CSVImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </>
  );
}

export default ClientList;
