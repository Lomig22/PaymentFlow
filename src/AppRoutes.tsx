import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardRedirect from "./components/DashboardRedirect";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import PricingPage from "./pages/PricingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import LegalNoticePage from "./pages/LegalNoticePage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import BlogPage from "./pages/BlogPage";
import BlogGarage from "./pages/BlogGarage";
import BlogManufacture from "./pages/BlogManufacture";
import BlogCommunication from "./pages/BlogCommunication";
import BlogComptableBanque from "./pages/BlogComptableBanque";
import BlogOptimisationRelance from "./pages/BlogOptimisationRelance";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ClientPage from "./components/clients/ClientPage";
import ReceivablesList from "./components/receivables/ReceivablesList";
import ReceivableForm from "./components/receivables/ReceivableForm";
import Settings from "./components/settings/Settings";
import ReminderList from "./components/reminders/ReminderList";
import HelpAndSupport from "./pages/HelpAndSupport";
import SuccessStoriesPage from "./pages/SuccessStoriesPage";
import AbonnementSuccess from "./pages/success";
import SubscribePage from "./pages/SubscribePage";
import Success from "./components/settings/paymentSuccess";
import AppHeader from "./components/AppHeader";
import ReportingRecouvrement from "./pages/ReportingRecouvrement";
import CrmPage from "./pages/CrmPage";
import DSOSimulator from "./pages/DSOSimulator";
import Personnalisation from "./pages/Personnalisation";

import { User } from "@supabase/supabase-js";
import AuthMFA from "./components/AuthMFA";
import ResetPassword from "./components/ResetPassword";

interface AppRoutesProps {
  user: User | null;
  mfaRequired?: boolean;
  onMFASuccess?: () => void;
}

export default function AppRoutes({ user, onMFASuccess }: AppRoutesProps) {
  return (
    <Router>
      {!user && <AppHeader user={user} onContactClick={() => {}} />}

      <Routes>
        {/* Routes publiques */}
        <Route
          path="/"
          element={
            !user ? (
              <LandingPage onGetStarted={() => {}} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/help" element={<HelpAndSupport />} />
        <Route path="/temoignages" element={<SuccessStoriesPage />} />
        <Route path="/subscribe" element={<SubscribePage />} />
        <Route
          path="/reporting-recouvrement"
          element={<ReportingRecouvrement />}
        />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/simulateur-dso" element={<DSOSimulator />} />
        <Route path="/personnalisation" element={<Personnalisation />} />
        <Route path="/paiement-abonement" element={<AbonnementSuccess />} />
        <Route
          path="/signup"
          element={
            !user ? <SignupPage /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pricing" element={<PricingPage setShowContact={() => {}} setDefaultSubject={() => {}} />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/mentions-legales" element={<LegalNoticePage />} />
        <Route path="/conditions-utilisation" element={<TermsOfUsePage />} />
        <Route
          path="/blog"
          element={
            <BlogPage setShowContact={() => {}} setDefaultSubject={() => {}} />
          }
        />
        <Route path="/blog-garage" element={<BlogGarage />} />
        <Route path="/blog-manufacture" element={<BlogManufacture />} />
        <Route path="/blog-communication" element={<BlogCommunication />} />
        <Route
          path="/blog-comptable-banque"
          element={<BlogComptableBanque />}
        />
        <Route path="/blog-optimisation-relance" element={<BlogOptimisationRelance />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Routes protégées */}
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard">
            <Route index element={<DashboardRedirect />} />
            <Route path=":email" element={<Dashboard />} />
          </Route>
          <Route
            path="mfa"
            element={<AuthMFA onMFASuccess={onMFASuccess || (() => {})} />}
          />
          <Route path="clients" element={<ClientPage />} />
          <Route path="receivables" element={<ReceivablesList />} />
          <Route path="receivables/new" element={<ReceivableForm onClose={() => {}} onReceivableAdded={() => {}} />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reminders" element={<ReminderList />} />
          <Route path="success" element={<Success />} />
        </Route>

        {/* Redirection par défaut */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </Router>
  );
}
