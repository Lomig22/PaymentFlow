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
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ClientPage from "./components/clients/ClientPage";
import ReceivablesList from "./components/receivables/ReceivablesList";
import Settings from "./components/settings/Settings";
import ReminderList from "./components/reminders/ReminderList";
import HelpAndSupport from "./pages/HelpAndSupport";
import AbonnementSuccess from "./pages/success";
import SubscribePage from "./pages/SubscribePage";
import Success from "./components/settings/paymentSuccess";
import AppHeader from "./components/AppHeader";

import { User } from "@supabase/supabase-js";
import AuthMFA from "./components/AuthMFA";

interface AppRoutesProps {
  user: User | null;
  mfaRequired?: boolean;
  onMFASuccess?: () => void;
}

export default function AppRoutes({ user,onMFASuccess  }: AppRoutesProps) {
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
        <Route path="/subscribe" element={<SubscribePage />} />
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
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Routes protégées */}
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard">
            <Route index element={<DashboardRedirect />} />
            <Route path=":email" element={<Dashboard user={user} />} />
          </Route>
          <Route path="mfa" element={<AuthMFA onMFASuccess={onMFASuccess}/>} />
          <Route path="clients" element={<ClientPage />} />
          <Route path="receivables" element={<ReceivablesList />} />
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
