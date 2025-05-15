import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  BanknoteIcon,
  Trash2,
} from "lucide-react";
import { Client, Receivable } from "../types/database";
import Swal from "sweetalert2";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList,
} from "recharts";
import ClientBalanceBar from "./chart/ClientBalanceBar";
interface DashboardStats {
  totalClients: number;
  clientsNeedingReminder: number;
  activeReminders: number;
  resolvedReminders: number;
  totalReceivables: number;
  totalAmount: number;
  overdueAmount: number;
  averagePaymentDelay: number;
  reminderSteps: {
    first: number;
    second: number;
    third: number;
    final: number;
    legal: number;
  };
}
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import EncoursClientChart from "./chart/EncoursClientChart";
import DsoChart from "./chart/DsoChart";
import RemindersCard from "./chart/RemindersCard";
import OverdueInvoices from "./chart/OverdueInvoices";
import RecentActivityChart from "./chart/RecentActivityChart";
import DashboardLayout from "./chart/DashboardLayout";
import SectorDistributionPieChart from "./chart/SectorDistributionPieChart";
import BalanceAgeeChart from "./chart/BalanceAgeeChart";
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    clientsNeedingReminder: 0,
    activeReminders: 0,
    resolvedReminders: 0,
    totalReceivables: 0,
    totalAmount: 0,
    overdueAmount: 0,
    averagePaymentDelay: 0,
    reminderSteps: {
      first: 0,
      second: 0,
      third: 0,
      final: 0,
      legal: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];
  const [reminderChartOptions, setReminderChartOptions] = useState({});
  const [reminderChartSeries, setReminderChartSeries] = useState([]);
  const generalStatsData = [
    {
      name: "Total Clients",
      value: stats.totalClients,
    },
    {
      name: "Clients à relancer",
      value: stats.clientsNeedingReminder,
    },
    {
      name: "Relances actives",
      value: stats.activeReminders,
    },
    {
      name: "Relances résolues",
      value: stats.resolvedReminders,
    },
  ];

  const amountData = [
    {
      name: "Total Créances",
      value: stats.totalAmount,
    },
    {
      name: "Montant en retard",
      value: stats.overdueAmount,
    },
  ];

  useEffect(() => {
    fetchDashboardStats();

    // Mettre en place un écouteur pour les changements en temps réel
    const clientsSubscription = supabase
      .channel("clients-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    const receivablesSubscription = supabase
      .channel("receivables-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "receivables" },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      clientsSubscription.unsubscribe();
      receivablesSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const reminderStepsData = [
      {
        name: "Relance 1",
        value: stats.reminderSteps.first,
        color: "#4f46e5",
      },
      {
        name: "Relance 2",
        value: stats.reminderSteps.second,
        color: "#10b981",
      },
      {
        name: "Relance 3",
        value: stats.reminderSteps.third,
        color: "#facc15",
      },
      {
        name: "Relance finale",
        value: stats.reminderSteps.final,
        color: "#f87171",
      },
      {
        name: "Procédure légale",
        value: stats.reminderSteps.legal,
        color: "#8b5cf6",
      },
    ];

    setReminderChartOptions({
      chart: {
        type: "donut",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 1000,
        },
      },
      labels: reminderStepsData.map((step) => step.name),
      colors: reminderStepsData.map((step) => step.color),
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "14px",
        },
      },
      legend: {
        position: "bottom",
        fontSize: "14px",
      },
      stroke: {
        show: true,
        width: 2,
      },
    });

    setReminderChartSeries(reminderStepsData.map((step) => step.value));
  }, [stats]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // console.log("user: ", user?.id);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Erreur lors du chargement des notifications:", error);
      } else {
        setNotifications(data);
      }
    };

    fetchNotifications();
  }, []);

  const getReminderStep = (receivable: Receivable & { client: Client }) => {
    const dueDate = new Date(receivable.due_date);
    const today = new Date();
    const daysLate = Math.ceil(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLate <= 0) return null;

    const delays = [
      { days: receivable.client.reminder_delay_1 || 15, step: "first" },
      { days: receivable.client.reminder_delay_2 || 30, step: "second" },
      { days: receivable.client.reminder_delay_3 || 45, step: "third" },
      { days: receivable.client.reminder_delay_final || 60, step: "final" },
    ];

    for (let i = delays.length - 1; i >= 0; i--) {
      if (daysLate >= delays[i].days) {
        return delays[i].step;
      }
    }

    return null;
  };

  const [openDetails, setOpenDetails] = useState(new Set());

  const toggleDetails = (id) => {
    const newSet = new Set(openDetails);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setOpenDetails(newSet);
  };

  //const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error(
        "Erreur lors de la mise à jour de la notification :",
        error.message
      );
      return;
    }

    // Mettre à jour localement la notification pour l'afficher comme lue
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );
  };

  const deleteNotification = async (id) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la suppression:", error.message);
      // Optionnel : ajouter une notification d’erreur
      return;
    }

    // Mise à jour de l’état local
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const fetchDashboardStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // console.log("user: ", user?.id);

    try {
      // Récupérer les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("owner_id", user?.id);

      if (clientsError) throw clientsError;

      // Récupérer les créances avec leurs clients
      const { data: receivablesData, error: receivablesError } = await supabase
        .from("receivables")
        .select(
          `
          *,
          client:clients(*)
        `
        )
        .eq("owner_id", user?.id);

      if (receivablesError) throw receivablesError;

      // Calculer les statistiques
      //Jet totalClients
      const totalClients = clientsData?.length || 0;
      const clientsNeedingReminder =
        clientsData?.filter((c) => c.needs_reminder)?.length || 0;

      const receivables = receivablesData || [];
      const totalReceivables = receivables.length;
      const totalAmount = receivables.reduce((sum, r) => sum + r.amount, 0);

      const today = new Date();
      const overdueReceivables = receivables.filter(
        (r) => new Date(r.due_date) < today
      );
      const overdueAmount = overdueReceivables.reduce(
        (sum, r) => sum + r.amount,
        0
      );

      // Calculer les retards de paiement moyens
      const delays = receivables
        .filter((r) => r.status === "paid")
        .map((r) => {
          const dueDate = new Date(r.due_date);
          const paidDate = new Date(r.updated_at);
          return Math.max(
            0,
            Math.ceil(
              (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          );
        });

      const averagePaymentDelay =
        delays.length > 0
          ? Math.round(
              delays.reduce((sum, delay) => sum + delay, 0) / delays.length
            )
          : 0;

      // Calculer les étapes de relance
      const reminderSteps = {
        first: 0,
        second: 0,
        third: 0,
        final: 0,
        legal: 0,
      };

      receivables.forEach((receivable) => {
        if (receivable.status === "legal") {
          reminderSteps.legal++;
        } /* else {
          console.log("Status: ",receivable.status);
          
          const step = getReminderStep(receivable);
          if (step) {

            reminderSteps[step as keyof typeof reminderSteps]++;
          }
        } */
      });
      receivables.forEach((receivable) => {
        if (receivable.status === "legal") {
          reminderSteps.legal++;
        } /* else {
          console.log("Status: ",receivable.status);
          
          const step = getReminderStep(receivable);
          if (step) {

            reminderSteps[step as keyof typeof reminderSteps]++;
          }
        } */
      });
      receivables.forEach((receivable) => {
        if (receivable.status === "Relance 1") {
          reminderSteps.first++;
        }
      });
      receivables.forEach((receivable) => {
        if (receivable.status === "Relance 2") {
          reminderSteps.second++;
        }
      });
      receivables.forEach((receivable) => {
        if (receivable.status === "Relance 3") {
          reminderSteps.third++;
        }
      });
      receivables.forEach((receivable) => {
        if (receivable.status === "Relance finale") {
          reminderSteps.final++;
        }
      });
      // console.log("REMINDER STEP: ", reminderSteps);

      setStats({
        totalClients,
        clientsNeedingReminder,
        activeReminders: overdueReceivables.length,
        resolvedReminders: receivables.filter((r) => r.status === "paid")
          .length,
        totalReceivables,
        totalAmount,
        overdueAmount,
        averagePaymentDelay,
        reminderSteps,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("unread"); // 'all', 'read', 'unread'
  const [visibleCount, setVisibleCount] = useState(5);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "read") return n.is_read;
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const data = [
    {
      name: "Encours client",
      Échu: 762212,
      "Non-échu": 903909,
      Litige: 262455,
      "Promesse de paiement": 194192,
      Recouvrement: 16315,
      "Avoirs non associés": -72769,
    },
  ];

  const colors = {
    Échu: "#FFB183",
    "Non-échu": "#D5D9FF",
    Litige: "#F44336",
    "Promesse de paiement": "#A4F3D2",
    Recouvrement: "#FFCD55",
    "Avoirs non associés": "#D5B3FF",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "8px",
            fontSize: "12px",
          }}
        >
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color }}>
              <strong>{entry.name}</strong> :{" "}
              {entry.value.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };
  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-2 text-gray-600">
            Vue d'ensemble de vos relances clients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clients */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Clients</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalClients}
            </p>
          </div>

          {/* Montant total des créances */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <BanknoteIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Montant total</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(stats.totalAmount)}
            </p>
          </div>

          {/* Montant en retard */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">
              Montant en retard
            </h3>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(stats.overdueAmount)}
            </p>
          </div>

          {/* Retard moyen de paiement */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">
              Retard moyen de paiement
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.averagePaymentDelay} jours
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          style={{ marginBottom: "20px" }}
        >
          <div className="xl:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl shadow bg-white">
                <ClientBalanceBar />
              </div>
              <div className="rounded-2xl shadow bg-white">
                <DsoChart />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl shadow bg-white">
                <DashboardLayout />
              </div>
              <div className="rounded-2xl shadow bg-white">
                <BalanceAgeeChart />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl shadow bg-white p-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Notifications
                </h2>
                <div className="mb-3 flex gap-2">
                  <div className="relative inline-block text-left mb-4">
                    <div>
                      <button
                        type="button"
                        className="inline-flex justify-center mt-5 w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        Filtre :{" "}
                        {filter === "all"
                          ? "Toutes"
                          : filter === "unread"
                          ? "Non lues"
                          : "Lues"}
                        <svg
                          className="-mr-1 ml-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setFilter("all");
                              setVisibleCount(5);
                              setDropdownOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              filter === "all"
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Toutes
                          </button>
                          <button
                            onClick={() => {
                              setFilter("unread");
                              setVisibleCount(5);
                              setDropdownOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              filter === "unread"
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Non lues
                          </button>
                          <button
                            onClick={() => {
                              setFilter("read");
                              setVisibleCount(5);
                              setDropdownOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              filter === "read"
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Lues
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* notification */}
                {visibleNotifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Aucune notification pour le moment.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {visibleNotifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="py-3 hover:bg-gray-50 transition-colors duration-200 rounded-md px-2"
                      >
                        <div className="flex justify-between items-start">
                          {/* Contenu principal */}
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                notification.type === "erreur"
                                  ? "text-red-600"
                                  : notification.type === "info"
                                  ? "text-blue-600"
                                  : "text-gray-800"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString(
                                "fr-FR"
                              )}
                            </p>
                            {openDetails.has(notification.id) &&
                              notification.details && (
                                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                  {notification.details}
                                </p>
                              )}
                          </div>

                          {/* Actions */}
                          <div className="ml-4 flex flex-col items-end gap-1">
                            <div className="flex gap-2">
                              {/* Bouton détails */}
                              <button
                                onClick={() => toggleDetails(notification.id)}
                                className="text-sm px-2 py-1 text-indigo-600 hover:underline hover:text-indigo-800 border border-indigo-200 rounded"
                                title="Afficher/Masquer les détails"
                              >
                                {openDetails.has(notification.id) ? "–" : "+"}
                              </button>

                              {/* Bouton supprimer avec SweetAlert2 */}
                              <button
                                onClick={() => {
                                  Swal.fire({
                                    title: "Supprimer cette notification ?",
                                    text: "Cette action est irréversible.",
                                    showCancelButton: true,
                                    confirmButtonText: "Oui, supprimer",
                                    cancelButtonText: "Annuler",
                                    buttonsStyling: false,
                                    customClass: {
                                      confirmButton:
                                        "bg-red-600 text-white px-4 py-2 rounded mr-2 hover:bg-red-700",
                                      cancelButton:
                                        "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
                                    },
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteNotification(notification.id);
                                      Swal.fire({
                                        title: "Supprimée !",
                                        text: "La notification a été supprimée.",
                                        icon: "success",
                                        confirmButtonText: "OK",
                                        buttonsStyling: false,
                                        customClass: {
                                          confirmButton:
                                            "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
                                        },
                                      });
                                    }
                                  });
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Marquer comme lue / lue */}
                            {!notification.is_read ? (
                              <button
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Marquer comme lue
                              </button>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">
                                Lue
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {visibleCount < filteredNotifications.length && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 5)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Afficher plus
                    </button>
                  </div>
                )}
                {visibleCount > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() =>
                        setVisibleCount(Math.max(5, visibleCount - 5))
                      }
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Afficher moins
                    </button>
                  </div>
                )}
              </div>
              <div className="rounded-2xl shadow bg-white">
                <RemindersCard />
              </div>
              <div className="rounded-2xl shadow bg-white">
                <OverdueInvoices />
              </div>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl shadow bg-white p-6">
                <DsoChart />
              </div>
              <div className="rounded-2xl shadow bg-white p-6">
                <RecentActivityChart />
              </div>
            </div> */}
          </div>
          {/* 
          <div className="xl:col-span-4 space-y-6">
            <div className="rounded-2xl shadow bg-white p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Relances
              </h3>
              <OverdueInvoices />
            </div>
            <div className="rounded-2xl shadow bg-white">
              <RemindersCard />
            </div>
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-800 font-semibold text-lg mb-6">
              Étapes de relance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1ère relance</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.reminderSteps.first / stats.totalReceivables) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.reminderSteps.first}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2ème relance</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.reminderSteps.second /
                            stats.totalReceivables) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.reminderSteps.second}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">3ème relance</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.reminderSteps.third / stats.totalReceivables) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.reminderSteps.third}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Relance finale</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.reminderSteps.final / stats.totalReceivables) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.reminderSteps.final}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contentieux</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-red-700 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.reminderSteps.legal / stats.totalReceivables) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.reminderSteps.legal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques générales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-800 font-semibold text-lg mb-6">
              Statistiques générales
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Clients à relancer
                </span>
                <span className="text-sm font-medium">
                  {stats.clientsNeedingReminder}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Relances actives</span>
                <span className="text-sm font-medium">
                  {stats.activeReminders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Relances résolues</span>
                <span className="text-sm font-medium">
                  {stats.resolvedReminders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Taux de résolution
                </span>
                <span className="text-sm font-medium">
                  {stats.totalReceivables > 0
                    ? `${Math.round(
                        (stats.resolvedReminders / stats.totalReceivables) * 100
                      )}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Montant moyen des créances
                </span>
                <span className="text-sm font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(
                    stats.totalReceivables > 0
                      ? stats.totalAmount / stats.totalReceivables
                      : 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
