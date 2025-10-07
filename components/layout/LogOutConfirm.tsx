'use client';
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { LogOut, X } from "lucide-react";
import { useState } from "react";

export function LogOutConfirm({ isExpanded }: { isExpanded: boolean }) {

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    const closeLogoutModal = () => {
        setShowLogoutConfirm(false);
        setLogoutError(null);
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            setLogoutError(null);

            // Marque localement l'onboarding comme vu/dismissed pour éviter un ré-affichage après reconnexion
            try {
                const response = await fetch("/api/user", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })

                const { user } = await response.json();
                const uid = user?.id as string | undefined;
                if (uid) {
                    localStorage.setItem(`onboarding_dismissed_${uid}`, "1");
                    localStorage.setItem(`onboarding_seen_${uid}`, "1");
                }
            } catch { }

            // Déconnexion de Supabase
            const res = await fetch("/api/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const result = await res.json();

            const error = result?.error;

            if (error) {
                console.log("COULD NOT LOG OUT");
                if (
                    error instanceof AuthSessionMissingError ||
                    error.message.includes("session_not_found")
                ) {
                    // Si l'erreur indique que la session n'existe pas, on considère que l'utilisateur est déjà déconnecté
                    window.location.href = "/";
                    return;
                }
                throw error;
            }

            // Redirection forcée vers la racine
            window.location.href = "/";
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            setLogoutError(
                "Une erreur est survenue lors de la déconnexion. Veuillez réessayer."
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    return <>
        <div className="border-t border-gray-200">
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`flex items-center  ${!isExpanded && "justify-center"
                    } w-full px-4 py-6 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-all duration-300`}
            >
                <LogOut className="h-5 w-5 flex-shrink-0 text-inherit" />
                <span
                    className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? "block opacity-100" : "hidden"
                        }`}
                >
                    Déconnexion
                </span>
            </button>
        </div>
        {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Confirmation
                        </h3>
                        <button
                            onClick={closeLogoutModal}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {logoutError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                            {logoutError}
                        </div>
                    )}
                    <p className="text-gray-600 mb-6">
                        Êtes-vous sûr de vouloir vous déconnecter ?
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={closeLogoutModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
}