import { ReactNode, Suspense } from "react";
import Link from "next/link";
import {
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import AbonnementInfo from "../settings/AbonnementInfo";
import { LogOutConfirm } from "./LogOutConfirm";
import { LayoutOnboarding } from "./LayoutOnBoarding";
import { Navigation } from "./Navigation";
import "./style.css";

interface LayoutProps {
  children: ReactNode;
}
export default async function Layout({ children }: LayoutProps) {

  return <div className="min-h-screen bg-gray-100">
    {/* Sidebar */}
    <div id="sidebar"
      className="fixed inset-y-0 left-0 bg-white shadow-lg transition-all duration-200 z-40 hover:w-64 w-24"
    >
      {/* Logo */}

      <div className="px-4">
        <Link
          href="/"
          className="flex items-center h-16 px-4 border-b border-gray-200"
        >
          <TrendingUp className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <span className="ml-2 text-xl font-bold text-gray-900 overflow-hidden whitespace-nowrap transition-opacity duration-200">
            PaymentFlow
          </span>
        </Link>
        <Navigation />
      </div>

      {/* Pied du menu */}
      <div className="absolute bottom-0 w-full left-0 hover:px-6 px-0">
        <div className=" border-gray-200">
          <Link
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center hover:justify-start w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-all duration-300`}
          >
            <HelpCircle className="h-5 w-5 flex-shrink-0 text-inherit" />
            <span className="ml-3 whitespace-nowrap transition-opacity duration-300 opacity-0 hover:block hover:opacity-100">
              Aides et support
            </span>
          </Link>
        </div>
        {/* Modal de confirmation de déconnexion */}
        <LogOutConfirm />
      </div>
    </div>
    {/* Main content */}
    <header className="p-4 border-b flex justify-end items-center gap-4">
      <Suspense fallback={
        <p className="text-sm text-gray-500 animate-pulse">
          Chargement de l’abonnement…
        </p>
      }><AbonnementInfo /></Suspense>

      <Link
        href="/pricing"
        className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition font-medium shadow-sm"
      >
        Voir les tarifs
      </Link>
    </header>

    <main className="transition-all duration-200">
      {children}
    </main>
    <LayoutOnboarding />
  </div>
    ;
}
